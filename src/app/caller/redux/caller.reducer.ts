import {CallerActionTypes, CallerActionUnion} from './caller.actions';
import {Player} from '../../shared/data/player.model';
import {MatchAggregate} from '../../shared/data/match.aggregate';

export interface CallerState {
    referees: Player[];
    refereesLoading: boolean;
    callerMatches: MatchAggregate[];
    secondCallMatches: MatchAggregate[];
    thirdCallMatches: MatchAggregate[];
}


const initialState: CallerState = {
    referees: [],
    refereesLoading: false,
    callerMatches: [],
    secondCallMatches: [],
    thirdCallMatches: []
};

export function reduceCallerState(state: CallerState = initialState, action: CallerActionUnion) {
    switch (action.type) {
        case CallerActionTypes.Load:
            return {
                ...state,
                refereesLoading: true
            };
        case CallerActionTypes.LoadSuccess:
            return {
                ...state,
                refereesLoading: false,
                callerMatches: action.payload
            };
        case CallerActionTypes.LoadError:
            return {
                ...state,
                refereesLoading: false
            };
        case CallerActionTypes.LoadReferees:
            return {
                ...state,
                refereesLoading: true
            };
        case CallerActionTypes.LoadRefereesSuccess:
            return {
                ...state,
                refereesLoading: false,
                referees: action.payload
            };
        case CallerActionTypes.LoadRefereesError:
            return {
                ...state,
                refereesLoading: false
            };
        case CallerActionTypes.LoadSecondCallMatchesSuccess:
            return {
                ...state,
                secondCallMatches: action.payload
            };
        case CallerActionTypes.LoadThirdCallMatchesSuccess:
            return {
                ...state,
                thirdCallMatches: action.payload
            };
        case CallerActionTypes.SetSelectedMatchAggregate:
            return {
                ...state,
                selectedMatchAggregate: action.payload
            };
        default:
            return state;
    }

}

export const getReferees = (state: CallerState) => state.referees;
export const getRefereesLoading = (state: CallerState) => state.refereesLoading;
export const getCallerMatchAggregates = (state: CallerState) => state.callerMatches;
export const getSecondCallMatchAggregates = (state: CallerState) => state.secondCallMatches;
export const getThirdCallMatchAggregates = (state: CallerState) => state.thirdCallMatches;
