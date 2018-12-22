import {CallerActionTypes, CallerActionUnion} from './caller.actions';
import {Player} from '../../shared/data/player.model';

export interface CallerState {
    referees: Player[];
    refereesLoading: boolean;
}


const initialState: CallerState = {
    referees: [],
    refereesLoading: false
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
                referees: action.payload
            };
        case CallerActionTypes.LoadError:
            return {
                ...state,
                refereesLoading: false
            };
        default:
            return state;
    }

}

export const getReferees = (state: CallerState) => state.referees;
export const getRefereesLoading = (state: CallerState) => state.refereesLoading;
