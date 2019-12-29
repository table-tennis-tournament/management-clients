import {PlayerActionsUnion, PlayerActionTypes} from './player.actions';
import {Player} from '../player.model';

export interface PlayerState {
    players: Player[];
    playersLoading: boolean;
}

const initialState: PlayerState = {
    players: [],
    playersLoading: false
};

export function reducePlayerState(state: PlayerState = initialState, action: PlayerActionsUnion) {
    switch (action.type) {
        case PlayerActionTypes.Load:
            return {
                ...state,
                playersLoading: true
            };
        case PlayerActionTypes.LoadSuccess:
            return {
                ...state,
                playersLoading: false,
                players: action.payload
            };
        default:
            return state;
    }

}

export const getPlayers = (state: PlayerState) => state.players;
export const getPlayersLoading = (state: PlayerState) => state.playersLoading;
