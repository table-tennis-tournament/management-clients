import {Match} from '../../shared/data/match.model';
import {MatchActionsUnion, MatchActionTypes} from './match.actions';

export interface MatchesState {
    matches: Match[];
    matchesLoading: boolean;
}


const initialState: MatchesState = {
    matches: [],
    matchesLoading: false
};

export function reduceMatchState(state: MatchesState = initialState, action: MatchActionsUnion) {
    switch (action.type) {
        case MatchActionTypes.Load:
            return {
                ...state,
                matchesLoading: true
            };
        case MatchActionTypes.LoadSuccess:
            return {
                ...state,
                matchesLoading: false,
                matches: action.payload
            };
        case MatchActionTypes.LoadError:
            return {
                ...state,
                matchesLoading: false
            };
        default:
            return state;
    }

}

export const getMatches = (state: MatchesState) => state.matches;
export const getMatchesLoading = (state: MatchesState) => state.matchesLoading;
