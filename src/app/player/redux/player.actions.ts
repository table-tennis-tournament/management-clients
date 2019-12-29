import {Action} from '@ngrx/store';
import {Player} from '../player.model';

export enum PlayerActionTypes {
    Load = '[Player] Load',
    LoadSuccess = '[Player] Load Success',
    LoadError = '[Player] Load Error'
}

export class LoadPlayers implements Action {
    readonly type = PlayerActionTypes.Load;

    constructor(public payload: any) {
    }
}

export class LoadPlayersSuccess implements Action {
    readonly type = PlayerActionTypes.LoadSuccess;

    constructor(public payload: Player[]) {
    }
}

export class LoadPlayersError implements Action {
    readonly type = PlayerActionTypes.LoadError;

    constructor(public payload: any) {
    }
}


export type PlayerActionsUnion =
    | LoadPlayers
    | LoadPlayersSuccess
    | LoadPlayersError;
