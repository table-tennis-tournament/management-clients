import { Action } from '@ngrx/store';
import { PlayerActionsUnion, PlayerActionTypes } from './player.actions';
import { PlayerType } from '../data/player.type.model';

export interface PlayerState {
  players: PlayerType[];
  playersLoading: boolean;
}

const initialState: PlayerState = {
  players: [],
  playersLoading: false,
};

/** Every action reaches the reducer; it handles those of [PlayerActionsUnion]. */
export function reducePlayerState(state: PlayerState = initialState, incoming: Action): PlayerState {
  const action = incoming as PlayerActionsUnion;
  switch (action.type) {
    case PlayerActionTypes.Load:
      return {
        ...state,
        playersLoading: true,
      };
    case PlayerActionTypes.LoadSuccess:
      return {
        ...state,
        playersLoading: false,
        players: action.payload,
      };
    case PlayerActionTypes.SetPaidSuccess:
      return {
        ...state,
        players: state.players.map((player) => {
          if (player.id === action.payload.id) {
            return action.payload;
          }
          return player;
        }),
      };
    default:
      return state;
  }
}

export const getPlayers = (state: PlayerState) => state.players;
export const getPlayersLoading = (state: PlayerState) => state.playersLoading;
