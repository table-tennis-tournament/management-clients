import {LoadResults, LoadResultsError, LoadResultsSuccess} from './result.actions';
import {reduceResultState, ResultState} from './result.reducer';
import {OneMatch} from './test-data';

const initialState: ResultState = Object.freeze({
    resultMatches: [],
    resultMatchesLoading: false
});


describe('the result reducer', () => {
    it('should handle the LoadResult action correctly', () => {
        const expectedState = {
            ...initialState,
            resultMatchesLoading: true
        };

        const newState = reduceResultState(initialState, new LoadResults(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadResultSuccess action correctly', () => {
        const expectedState = {
            ...initialState,
            resultMatchesLoading: false,
            resultMatches: OneMatch
        };

        const newState = reduceResultState(initialState, new LoadResultsSuccess(OneMatch));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the LoadResult action correctly', () => {
        const expectedState = {
            ...initialState,
            resultMatchesLoading: false
        };

        const newState = reduceResultState(initialState, new LoadResultsError(null));
        expect(newState).toEqual(expectedState);
    });


});
