/*
 * Update events: how a client follows the backend's live updates (ADR 0003).
 *
 * This folder is copied verbatim into admin-view and tablemanager-view
 * (`src/app/shared/update-events/`). Keep the copies identical; change them together.
 *
 * The module owns connecting, re-subscribing after a reconnect, Scope filtering, coalescing
 * bursts per reload target and Resynchronization. A client only declares an
 * [UpdateClientConfig]: the Topics it renders, which reload targets each event type
 * invalidates, and which targets to reload after a reconnect. The transport is a seam with
 * two adapters: [StompUpdateTransport] in production, [InMemoryUpdateTransport] in tests.
 */
import { Subject } from 'rxjs';
import { auditTime, groupBy, mergeMap } from 'rxjs/operators';

/** The functional areas update events are published on. */
export type UpdateTopic = 'matches' | 'tables' | 'queue' | 'players' | 'settings';

/**
 * The part of the tournament an event refers to. An empty list means the event does not touch
 * that dimension; a missing list (or a missing scope) means it is not restricted.
 */
export interface UpdateScope {
  matchIds?: number[];
  typeIds?: number[];
  tableIds?: number[];
}

/** The envelope of every update event: `{type, scope, payload}`. */
export interface UpdateEvent {
  type: string;
  scope?: UpdateScope;
  payload?: unknown;
}

/** What a transport reports to the module. */
export interface UpdateTransportListener {
  /** An update event arrived on one of the subscribed Topics. */
  event(topic: UpdateTopic, event: UpdateEvent): void;
  /** The transport (re)connected and subscribed to the Topics again. */
  connected(): void;
  /** The connection was lost; the transport reconnects on its own. */
  disconnected(reason?: unknown): void;
}

/** The seam between the module and the network. */
export interface UpdateTransport {
  /** Connects, subscribes to [topics] on every (re)connect, and returns a function that disconnects. */
  connect(topics: UpdateTopic[], listener: UpdateTransportListener): () => void;
}

export interface UpdateClientConfig<Target extends string> {
  /** The Topics this client renders. */
  topics: UpdateTopic[];
  /** The reload targets each event type invalidates. */
  reloads: Partial<Record<string, Target[]>>;
  /** Event types this client knowingly does not render (not warned about). */
  ignored?: string[];
  /** The targets reloaded after a reconnect, because events may have been missed. */
  resync: Target[];
  /**
   * Whether an event with this [scope] concerns [target] in this client's view. Called only
   * for events that carry a scope; without one, every target is reloaded to be safe.
   */
  isRelevant?(target: Target, scope: UpdateScope): boolean;
  /** Burst window: at most one reload per target within this period. */
  auditMs?: number;
}

export const DEFAULT_AUDIT_MS = 200;

export interface UpdateConnection {
  disconnect(): void;
}

/**
 * Follows the update events described by [config] over [transport] and calls [reload] for every
 * invalidated target: at most once per target and burst window, always after the latest event.
 * The first connect does not reload (the client loads its state on start); every later connect
 * reloads the [UpdateClientConfig.resync] targets.
 */
export function connectUpdates<Target extends string>(
  transport: UpdateTransport,
  config: UpdateClientConfig<Target>,
  reload: (target: Target) => void
): UpdateConnection {
  const requests = new Subject<Target>();
  const coalesced = requests
    .pipe(
      groupBy((target) => target),
      mergeMap((perTarget) => perTarget.pipe(auditTime(config.auditMs ?? DEFAULT_AUDIT_MS)))
    )
    .subscribe(reload);

  let connects = 0;
  const disconnect = transport.connect(config.topics, {
    event: (_topic, event) => targetsFor(config, event).forEach((target) => requests.next(target)),
    connected: () => {
      if (connects++ > 0) {
        config.resync.forEach((target) => requests.next(target));
      }
    },
    disconnected: (reason) => console.log('update events disconnected', reason),
  });

  return {
    disconnect: () => {
      disconnect();
      coalesced.unsubscribe();
    },
  };
}

/** The targets [event] invalidates for a client with [config], after Scope filtering. */
export function targetsFor<Target extends string>(config: UpdateClientConfig<Target>, event: UpdateEvent): Target[] {
  const targets = config.reloads[event.type];
  if (!targets) {
    if (!config.ignored?.includes(event.type)) {
      console.warn('unknown update event type', event.type);
    }
    return [];
  }
  const scope = event.scope;
  if (!scope || !config.isRelevant) {
    return targets;
  }
  return targets.filter((target) => config.isRelevant!(target, scope));
}

/** Whether a scope list touches its dimension at all (missing = unrestricted, empty = untouched). */
export function touches(ids: number[] | undefined): boolean {
  return ids === undefined || ids.length > 0;
}

/** Whether a scope list names one of [candidates] (a missing list names everything). */
export function touchesAny(ids: number[] | undefined, candidates: number[]): boolean {
  return ids === undefined || ids.some((id) => candidates.includes(Number(id)));
}

/** Parses a message body into an [UpdateEvent], or `null` if it is not one. */
export function parseUpdateEvent(body: string): UpdateEvent | null {
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed.type === 'string' ? (parsed as UpdateEvent) : null;
  } catch {
    return null;
  }
}
