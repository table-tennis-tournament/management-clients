import { LoadMatchList, LoadMatchListError, LoadMatchListSuccess } from './matchlist.actions';
import { MatchListState, reduceMatchListState } from './matchlist.reducer';
import { testData } from './test.data';

const initialState: MatchListState = Object.freeze({
  matchList: [],
  matchListLoading: false,
  selectedDiscipline: 0,
});

const matchData = testData;

describe('the matchList reducer', () => {
  it('should handle the LoadMatchList action correctly', () => {
    const expectedState = {
      ...initialState,
      matchListLoading: true,
    };

    const newState = reduceMatchListState(initialState, new LoadMatchList(null));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadMatchListSuccess action correctly', () => {
    const expectedState = {
      ...initialState,
      matchList: matchData,
      matchListLoading: false,
    };

    const newState = reduceMatchListState(initialState, new LoadMatchListSuccess(matchData));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadMatchListError action correctly', () => {
    const expectedState = {
      ...initialState,
      matchListLoading: false,
    };

    const newState = reduceMatchListState(initialState, new LoadMatchListError(null));
    expect(newState).toEqual(expectedState);
  });
});
