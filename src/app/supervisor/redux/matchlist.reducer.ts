import {MatchListActionTypes, MatchListActionUnion} from './matchlist.actions';
import {MatchList} from '../matchlist.model';

export interface MatchListState {
    matchList: MatchList[];
    matchListLoading: boolean;
}


const initialState: MatchListState = {
    matchList: [],
    matchListLoading: false
};

export function reduceMatchListState(state: MatchListState = initialState, action: MatchListActionUnion) {
    switch (action.type) {
        case MatchListActionTypes.Load:
            return {
                ...state,
                matchListLoading: true
            };
        case MatchListActionTypes.LoadSuccess:
            return {
                ...state,
                matchListLoading: false,
                matchList: action.payload
            };
        case MatchListActionTypes.LoadError:
            return {
                ...state,
                matchListLoading: false
            };
        default:
            return state;
    }

}

export const getMatchList = (state: MatchListState) => state.matchList;
export const getMatchListLoading = (state: MatchListState) => state.matchListLoading;
