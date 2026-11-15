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
  MATCH_STATES,
  MatchStateName,
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

  it('isCompleted and isFinished tell a played result from a walkover', () => {
    expect(statesWhere(isCompleted)).toEqual(['Completed']);
    expect(statesWhere(isFinished)).toEqual(['Finished']);
  });

  it('isOver for both terminal states', () => {
    expect(statesWhere(isOver)).toEqual(['Completed', 'Finished']);
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
});
