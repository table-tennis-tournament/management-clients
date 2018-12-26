import {testPlayers} from './test.data';
import {CallerState, reduceCallerState} from './caller.reducer';
import {LoadRefereesList, LoadRefereesListError, LoadRefereesListSuccess, SetSelectedMatchAggregate} from './caller.actions';

const initialState: CallerState = Object.freeze({
    referees: [],
    refereesLoading: false,
    selectedMatchAggregate: null
});

describe('the callerState reducer', () => {
    it('should handle the LoadReferees action correctly', () => {
        const expectedState = {
            ...initialState,
            refereesLoading: true
        };

        const newState = reduceCallerState(initialState, new LoadRefereesList(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadRefereesSuccess action correctly', () => {
        const expectedState = {
            ...initialState,
            referees: testPlayers,
            refereesLoading: false
        };

        const newState = reduceCallerState(initialState, new LoadRefereesListSuccess(testPlayers));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadRefereesError action correctly', () => {
        const expectedState = {
            ...initialState,
            refereesLoading: false
        };

        const newState = reduceCallerState(initialState, new LoadRefereesListError(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the SetSelectedMatchAggregate action correctly', () => {
        const myNewAggregate = {
            name: 'test'
        };
        const expectedState = {
            ...initialState,
            selectedMatchAggregate: myNewAggregate
        };

        const newState = reduceCallerState(initialState, new SetSelectedMatchAggregate(myNewAggregate));
        expect(newState).toEqual(expectedState);
    });

});
