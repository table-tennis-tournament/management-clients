import { MatchTestData } from './test-data';
import { MatchesState, reduceMatchState } from './match.reducer';
import { LoadMatches, LoadMatchesError, LoadMatchesSuccess } from './match.actions';

const initialState: MatchesState = Object.freeze({
  matches: [],
  matchesLoading: false,
});

const matchData = MatchTestData;

describe('the match reducer', () => {
  it('should handle the LoadMatches action correctly', () => {
    const expectedState = {
      ...initialState,
      matchesLoading: true,
    };

    const newState = reduceMatchState(initialState, new LoadMatches(null));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadMatchesSuccess action correctly', () => {
    const expectedState = {
      ...initialState,
      matches: matchData,
      matchesLoading: false,
    };

    const newState = reduceMatchState(initialState, new LoadMatchesSuccess(matchData));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadMatchesError action correctly', () => {
    const expectedState = {
      ...initialState,
      matchesLoading: false,
    };

    const newState = reduceMatchState(initialState, new LoadMatchesError(null));
    expect(newState).toEqual(expectedState);
  });
});
