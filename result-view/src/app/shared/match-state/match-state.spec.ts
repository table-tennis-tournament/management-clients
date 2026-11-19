// Copied verbatim into each client next to match-state.ts; keep the copies identical.
import {
  callNumber,
  HasMatchState,
  isAtTable,
  isBeingPlayed,
  isCompleted,
  isFinished,
  isInProgress,
  isOpen,
  isOver,
  isQueued,
  isWaiting,
  isWalkover,
  MATCH_STATES,
  MatchStateName,
  minutesSinceFirstCall,
} from './match-state';

const inState = (state: MatchStateName, calls = 0): HasMatchState => ({
  state,
  callNumber: calls,
});

/** The states for which [predicate] holds. */
const statesWhere = (predicate: (match: HasMatchState) => boolean) =>
  MATCH_STATES.filter((state) => predicate(inState(state)));

describe('match state', () => {
  it('isOpen only for Open', () => {
    expect(statesWhere(isOpen)).toEqual(['Open']);
  });

  it('isQueued only for InQueue', () => {
    expect(statesWhere(isQueued)).toEqual(['InQueue']);
  });

  it('isWaiting before the Match reaches a table', () => {
    expect(statesWhere(isWaiting)).toEqual(['Open', 'InQueue']);
  });

  it('isAtTable only while assigned and not started', () => {
    expect(statesWhere(isAtTable)).toEqual(['OnTable']);
  });

  it('isBeingPlayed only for Started', () => {
    expect(statesWhere(isBeingPlayed)).toEqual(['Started']);
  });

  it('isCompleted, isFinished and isWalkover tell a result, a pending result and a walkover apart', () => {
    expect(statesWhere(isCompleted)).toEqual(['Completed']);
    expect(statesWhere(isFinished)).toEqual(['Finished']);
    expect(statesWhere(isWalkover)).toEqual(['Walkover']);
  });

  it('isOver once the match has left the table for good', () => {
    expect(statesWhere(isOver)).toEqual(['Completed', 'Finished', 'Walkover']);
  });

  it('isInProgress between waiting and over', () => {
    expect(statesWhere(isInProgress)).toEqual(['InQueue', 'OnTable', 'Started']);
  });

  it('every state is exactly one of open, in progress or over', () => {
    for (const state of MATCH_STATES) {
      const match = inState(state);
      expect([isOpen(match), isInProgress(match), isOver(match)].filter(Boolean).length).toBe(1);
    }
  });

  it('answers nothing for a missing or legacy state', () => {
    for (const match of [{}, { state: null }, { state: 'Callable' }]) {
      expect(isWaiting(match) || isInProgress(match) || isOver(match)).toBe(false);
    }
  });

  it('callNumber reads the call count, 0 when absent', () => {
    expect(callNumber(inState('OnTable', 2))).toBe(2);
    expect(callNumber({ state: 'OnTable' })).toBe(0);
  });

  it('minutesSinceFirstCall counts whole minutes since the first Call, none before it', () => {
    const firstCallTime = '2026-11-16T10:00:00+01:00';
    const at = (time: string) => new Date(time).getTime();
    expect(minutesSinceFirstCall({ firstCallTime }, at('2026-11-16T09:00:59Z'))).toBe(0);
    // the offset counts, whatever time zone the browser runs in
    expect(minutesSinceFirstCall({ firstCallTime }, at('2026-11-16T09:07:30Z'))).toBe(7);
    // a clock running slightly behind the backend shows no negative time
    expect(minutesSinceFirstCall({ firstCallTime }, at('2026-11-16T08:59:00Z'))).toBe(0);
    expect(minutesSinceFirstCall({ firstCallTime: null }, at(firstCallTime))).toBeNull();
    expect(minutesSinceFirstCall({}, at(firstCallTime))).toBeNull();
  });
});
