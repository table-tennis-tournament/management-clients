import { testAggregate, testPlayers } from './test.data';
import { CallerState, reduceCallerState } from './caller.reducer';
import {
  LoadCallerMatches,
  LoadRefereesList,
  LoadRefereesListError,
  LoadRefereesListSuccess,
  LoadCallerMatchesSuccess,
  SetSelectedMatchAggregate,
  LoadSecondCallMatchesSuccess,
  LoadThirdCallMatchesSuccess,
} from './caller.actions';

const initialState: CallerState = Object.freeze({
  referees: [],
  refereesLoading: false,
  callerMatches: [],
  selectedMatchAggregate: null,
  selectedSecondCallMatchAggregate: null,
  secondCallMatches: [],
  thirdCallMatches: [],
});

describe('the callerState reducer', () => {
  it('should handle the LoadCallerMatches action correctly', () => {
    const expectedState = {
      ...initialState,
      refereesLoading: true,
    };

    const newState = reduceCallerState(initialState, new LoadCallerMatches());
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadCallerMatchesSuccess action correctly', () => {
    const expectedState = {
      ...initialState,
      callerMatches: testAggregate,
      refereesLoading: false,
    };

    const newState = reduceCallerState(initialState, new LoadCallerMatchesSuccess(testAggregate));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadCallerMatchesError action correctly', () => {
    const expectedState = {
      ...initialState,
      refereesLoading: false,
    };

    const newState = reduceCallerState(initialState, new LoadRefereesListError(null));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadReferees action correctly', () => {
    const expectedState = {
      ...initialState,
      refereesLoading: true,
    };

    const newState = reduceCallerState(initialState, new LoadRefereesList(null));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadRefereesSuccess action correctly', () => {
    const expectedState = {
      ...initialState,
      referees: testPlayers,
      refereesLoading: false,
    };

    const newState = reduceCallerState(initialState, new LoadRefereesListSuccess(testPlayers));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the LoadRefereesError action correctly', () => {
    const expectedState = {
      ...initialState,
      refereesLoading: false,
    };

    const newState = reduceCallerState(initialState, new LoadRefereesListError(null));
    expect(newState).toEqual(expectedState);
  });

  it('should handle the SetSelectedMatchAggregate action correctly', () => {
    const myNewAggregate = {
      name: 'test',
    };
    const expectedState = {
      ...initialState,
      selectedMatchAggregate: myNewAggregate,
    };

    const newState = reduceCallerState(initialState, new SetSelectedMatchAggregate(myNewAggregate));
    expect(newState).toEqual(expectedState);
  });

  describe('the selected Second or Third call', () => {
    const repeatCall = (matchId: number, callNumber: number) => ({ callNumber, matches: [{ id: matchId }] });

    it('selects the first waiting Second call when the lists load', () => {
      const state = reduceCallerState(
        initialState,
        new LoadSecondCallMatchesSuccess([repeatCall(1, 2), repeatCall(2, 2)])
      );
      expect(state.selectedSecondCallMatchAggregate).toEqual(repeatCall(1, 2));
    });

    it('selects a Third call when no Second call waits', () => {
      const state = reduceCallerState(initialState, new LoadThirdCallMatchesSuccess([repeatCall(3, 3)]));
      expect(state.selectedSecondCallMatchAggregate).toEqual(repeatCall(3, 3));
    });

    it('keeps the selected call while it still waits, with its reloaded data', () => {
      const selected = { ...initialState, selectedSecondCallMatchAggregate: repeatCall(2, 2) };
      const reloaded = { ...repeatCall(2, 2), name: 'reloaded' };
      const state = reduceCallerState(selected, new LoadSecondCallMatchesSuccess([repeatCall(1, 2), reloaded]));
      expect(state.selectedSecondCallMatchAggregate).toEqual(reloaded);
    });

    it('moves on to the next call once the selected one is announced', () => {
      const selected = {
        ...initialState,
        selectedSecondCallMatchAggregate: repeatCall(1, 2),
        thirdCallMatches: [repeatCall(3, 3)],
      };
      const state = reduceCallerState(selected, new LoadSecondCallMatchesSuccess([]));
      expect(state.selectedSecondCallMatchAggregate).toEqual(repeatCall(3, 3));
    });

    it('selects nothing when no call waits', () => {
      const selected = { ...initialState, selectedSecondCallMatchAggregate: repeatCall(1, 2) };
      expect(
        reduceCallerState(selected, new LoadSecondCallMatchesSuccess([])).selectedSecondCallMatchAggregate
      ).toBeNull();
    });
  });
});
