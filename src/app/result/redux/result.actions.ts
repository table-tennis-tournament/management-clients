import {Action} from '@ngrx/store';
import {Match} from '../../shared/data/match.model';

export enum ResultActionTypes {
    Load = '[Result] Load',
    LoadSuccess = '[Result] Load Success',
    LoadError = '[Result] Load Error'
}

export class LoadResults implements Action {
    readonly type = ResultActionTypes.Load;

    constructor(public payload: any) {
    }
}

export class LoadResultsSuccess implements Action {
    readonly type = ResultActionTypes.LoadSuccess;

    constructor(public payload: Match[]) {
    }
}

export class LoadResultsError implements Action {
    readonly type = ResultActionTypes.LoadError;

    constructor(public payload: any) {
    }
}


export type ResultActionsUnion =
    | LoadResults
    | LoadResultsSuccess
    | LoadResultsError;
