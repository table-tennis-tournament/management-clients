import {ResultActionsUnion, ResultActionTypes} from './result.actions';
import {Match} from '../../shared/data/match.model';

export interface ResultState {
    resultMatches: Match[];
    resultMatchesLoading: boolean;
}


const initialState: ResultState = {
    resultMatches: [],
    resultMatchesLoading: false
};

export function reduceResultState(state: ResultState = initialState, action: ResultActionsUnion) {
    switch (action.type) {
        case ResultActionTypes.Load:
            return {
                ...state,
                resultMatchesLoading: true
            };
        case ResultActionTypes.LoadSuccess:
            return {
                ...state,
                resultMatchesLoading: false,
                resultMatches: action.payload
            };
        case ResultActionTypes.LoadError:
            return {
                ...state,
                resultMatchesLoading: false
            };
        default:
            return state;
    }

}

export const getResultMatches = (state: ResultState) => state.resultMatches;
export const getResultMatchesLoading = (state: ResultState) => state.resultMatchesLoading;
