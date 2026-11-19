/*
 * Match state: the questions clients ask about where a Match is in its lifecycle.
 *
 * This file is copied verbatim into admin-view, tablemanager-view and result-view
 * (`src/app/shared/match-state/`). Keep the copies identical; change all three together.
 *
 * The backend derives the state once and sends it on every Match DTO as `state` (one of
 * [MATCH_STATES]) together with `callNumber` (0 = not called yet, 1 = Called, 2 = Second call,
 * 3 = Third call; the highest call of the match's players) and `firstCallTime`. Components ask these
 * questions instead of comparing state names.
 *
 * Lifecycle (see GLOSSARY.md): Open → (InQueue) → OnTable (At Table) → Started → Completed.
 * A Match freed at its table ("Frei") is Finished until its result is entered, then Completed;
 * a Match that is not played at all because a Side did not appear ("kampflos") is a Walkover.
 */

export const MATCH_STATES = ['Open', 'InQueue', 'OnTable', 'Started', 'Completed', 'Finished', 'Walkover'] as const;

export type MatchStateName = (typeof MATCH_STATES)[number];

/** Anything carrying the backend's state fields; every client Match model fits. */
export interface HasMatchState {
  state?: string | null;
  callNumber?: number | null;
  /** When the first Call was announced, as the backend sends it (`2026-11-16T10:00:00`, local time). */
  firstCallTime?: string | null;
}

/** Neither queued nor at a table nor played. */
export function isOpen(match: HasMatchState): boolean {
  return match.state === 'Open';
}

/** In the Queue, waiting to be started automatically. */
export function isQueued(match: HasMatchState): boolean {
  return match.state === 'InQueue';
}

/** Not yet at a table: Open or in the Queue. */
export function isWaiting(match: HasMatchState): boolean {
  return isOpen(match) || isQueued(match);
}

/** Assigned to a table but not started (it may have been called). */
export function isAtTable(match: HasMatchState): boolean {
  return match.state === 'OnTable';
}

/** Being played at its table. */
export function isBeingPlayed(match: HasMatchState): boolean {
  return match.state === 'Started';
}

/** Ended with a played result. */
export function isCompleted(match: HasMatchState): boolean {
  return match.state === 'Completed';
}

/** Played and freed at its table ("Frei"); its result is entered later. */
export function isFinished(match: HasMatchState): boolean {
  return match.state === 'Finished';
}

/** Not played at all: a Side did not appear, the other won without playing ("kampflos"). */
export function isWalkover(match: HasMatchState): boolean {
  return match.state === 'Walkover';
}

/** Over: completed, waiting for its result or a walkover. */
export function isOver(match: HasMatchState): boolean {
  return isCompleted(match) || isFinished(match) || isWalkover(match);
}

/** Queued, at a table or being played: no longer free to plan, not over yet. */
export function isInProgress(match: HasMatchState): boolean {
  return isQueued(match) || isAtTable(match) || isBeingPlayed(match);
}

/** How many Calls have been announced: 0 to 3. */
export function callNumber(match: HasMatchState): number {
  return match.callNumber ?? 0;
}

/** Whole minutes the players have been waited for since the first Call, at [now] (ms); `null` before it. */
export function minutesSinceFirstCall(match: HasMatchState, now: number): number | null {
  if (!match.firstCallTime) {
    return null;
  }
  return Math.max(0, Math.floor((now - new Date(match.firstCallTime).getTime()) / 60000));
}
