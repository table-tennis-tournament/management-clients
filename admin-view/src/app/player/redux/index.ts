import * as fromPlayers from './player.reducer';
import * as fromRoot from '../../app-state.reducer';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

export interface PlayersState {
  players: fromPlayers.PlayerState;
}

export interface State extends fromRoot.State {
  players: PlayersState;
}

export const reducers: ActionReducerMap<PlayersState> = {
  players: fromPlayers.reducePlayerState,
};

export const selectPlayersState = createFeatureSelector<PlayersState>('players');

export const selectPlayers = createSelector(selectPlayersState, (state) => state.players);

export const getAllPlayersState = createSelector(selectPlayers, fromPlayers.getPlayers);
