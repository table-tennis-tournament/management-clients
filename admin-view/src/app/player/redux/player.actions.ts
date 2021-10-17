import { Action } from '@ngrx/store';
import { PlayerType } from '../data/player.type.model';

export enum PlayerActionTypes {
  Load = '[Player] Load',
  LoadSuccess = '[Player] Load Success',
  LoadError = '[Player] Load Error',
  SetPaid = '[Player] SetPaid',
  SetPaidSuccess = '[Player] SetPaid Success',
  SetPaidError = '[Player] SetPaid Error',
}

export class LoadPlayers implements Action {
  readonly type = PlayerActionTypes.Load;

  constructor(public payload: any) {}
}

export class LoadPlayersSuccess implements Action {
  readonly type = PlayerActionTypes.LoadSuccess;

  constructor(public payload: PlayerType[]) {}
}

export class LoadPlayersError implements Action {
  readonly type = PlayerActionTypes.LoadError;

  constructor(public payload: any) {}
}
export class SetPlayerPaid implements Action {
  readonly type = PlayerActionTypes.SetPaid;

  constructor(public payload: any) {}
}

export class SetPlayerPaidSuccess implements Action {
  readonly type = PlayerActionTypes.SetPaidSuccess;

  constructor(public payload: PlayerType) {}
}

export class SetPlayerPaidError implements Action {
  readonly type = PlayerActionTypes.SetPaidError;

  constructor(public payload: any) {}
}

export type PlayerActionsUnion =
  | LoadPlayers
  | LoadPlayersSuccess
  | LoadPlayersError
  | SetPlayerPaid
  | SetPlayerPaidSuccess
  | SetPlayerPaidError;
