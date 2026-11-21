// Part of the update-events module; keep identical in every client (see update-events.ts).
import { TestScheduler } from 'rxjs/testing';
import { InMemoryUpdateTransport } from './in-memory-transport';
import {
  connectUpdates,
  DEFAULT_AUDIT_MS,
  parseUpdateEvent,
  targetsFor,
  touches,
  touchesAny,
  UpdateClientConfig,
  UpdateEvent,
} from './update-events';

type Target = 'tables' | 'matches' | 'players';

const config: UpdateClientConfig<Target> = {
  topics: ['matches', 'tables'],
  reloads: {
    MATCH_STARTED: ['matches', 'tables'],
    TABLE_LOCKED: ['tables'],
    PLAYER_PAID: ['players'],
  },
  ignored: ['MATCH_LIST_CHANGED'],
  resync: ['matches', 'tables'],
  isRelevant: (target, scope) => target !== 'tables' || touches(scope.tableIds),
};

const event = (type: string, tableIds?: number[]): UpdateEvent => ({
  type,
  scope: tableIds ? { matchIds: [1], typeIds: [], tableIds } : undefined,
});

/** Runs [body] in virtual time and returns the reloads it caused, as `"<ms>:<target>"`. */
function reloadsDuring(body: (transport: InMemoryUpdateTransport, time: () => number) => void): string[] {
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  const reloads: string[] = [];
  scheduler.run(({ flush }) => {
    const transport = new InMemoryUpdateTransport();
    connectUpdates(transport, config, (target) => reloads.push(`${scheduler.now()}:${target}`));
    body(transport, () => scheduler.now());
    flush();
  });
  return reloads;
}

describe('update events', () => {
  describe('targetsFor', () => {
    it('maps an event type to its reload targets', () => {
      expect(targetsFor(config, event('MATCH_STARTED', [3]))).toEqual(['matches', 'tables']);
    });

    it('drops targets the scope does not concern', () => {
      expect(targetsFor(config, event('MATCH_STARTED', []))).toEqual(['matches']);
    });

    it('reloads every target of an event without a scope, to be safe', () => {
      expect(targetsFor(config, event('MATCH_STARTED'))).toEqual(['matches', 'tables']);
    });

    it('gives no targets for ignored and unknown events', () => {
      expect(targetsFor(config, event('MATCH_LIST_CHANGED'))).toEqual([]);
      expect(targetsFor(config, event('SOMETHING_NEW'))).toEqual([]);
    });
  });

  it('touches and touchesAny read missing lists as unrestricted and empty lists as untouched', () => {
    expect(touches(undefined)).toBe(true);
    expect(touches([])).toBe(false);
    expect(touches([4])).toBe(true);
    expect(touchesAny(undefined, [1])).toBe(true);
    expect(touchesAny([2, 3], [3, 9])).toBe(true);
    expect(touchesAny([2], [3])).toBe(false);
  });

  it('parseUpdateEvent accepts only envelopes with a type', () => {
    expect(parseUpdateEvent('{"type":"TABLE_LOCKED","scope":{"tableIds":[1]}}')).toEqual({
      type: 'TABLE_LOCKED',
      scope: { tableIds: [1] },
    });
    expect(parseUpdateEvent('not json')).toBeNull();
    expect(parseUpdateEvent('{"payload":1}')).toBeNull();
  });

  describe('connectUpdates', () => {
    it('subscribes to the configured topics', () => {
      const transport = new InMemoryUpdateTransport();
      connectUpdates(transport, config, () => undefined);
      expect(transport.topics).toEqual(['matches', 'tables']);
    });

    it('reloads each invalidated target once the burst window has passed', () => {
      expect(reloadsDuring((transport) => transport.publish('tables', event('TABLE_LOCKED', [2])))).toEqual([
        `${DEFAULT_AUDIT_MS}:tables`,
      ]);
    });

    it('coalesces a burst per target, without losing targets of other events', () => {
      const reloads = reloadsDuring((transport) => {
        for (let i = 0; i < 10; i++) {
          transport.publish('tables', event('TABLE_LOCKED', [i + 1]));
        }
        transport.publish('matches', event('MATCH_STARTED', []));
      });
      expect(reloads).toEqual([`${DEFAULT_AUDIT_MS}:tables`, `${DEFAULT_AUDIT_MS}:matches`]);
    });

    it('ignores events on topics the client did not subscribe to', () => {
      expect(reloadsDuring((transport) => transport.publish('players', event('PLAYER_PAID')))).toEqual([]);
    });

    it('does not resynchronize on the first connect', () => {
      expect(reloadsDuring(() => undefined)).toEqual([]);
    });

    it('resynchronizes after a reconnect and misses what was published while disconnected', () => {
      const reloads = reloadsDuring((transport) => {
        transport.drop('network');
        transport.publish('tables', event('TABLE_LOCKED', [1]));
        transport.reconnect();
      });
      expect(reloads).toEqual([`${DEFAULT_AUDIT_MS}:matches`, `${DEFAULT_AUDIT_MS}:tables`]);
    });

    it('stops reloading after disconnect', () => {
      const reloads: string[] = [];
      const transport = new InMemoryUpdateTransport();
      connectUpdates(transport, config, (target) => reloads.push(target)).disconnect();
      transport.publish('tables', event('TABLE_LOCKED', [1]));
      expect(reloads).toEqual([]);
    });
  });
});
