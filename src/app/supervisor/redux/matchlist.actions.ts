import {Action} from '@ngrx/store';
import {Match} from '../../shared/data/match.model';

export enum MatchListActionTypes {
    Load = '[Matchlist] Load',
    LoadSuccess = '[Matchlist] Load Success',
    LoadError = '[Matchlist] Load Error'
}

export class LoadMatchList implements Action {
    readonly type = MatchListActionTypes.Load;

    constructor(public payload: any) {
    }
}

export class LoadMatchListSuccess implements Action {
    readonly type = MatchListActionTypes.LoadSuccess;

    constructor(public payload: Match[]) {
    }
}

export class LoadMatchListError implements Action {
    readonly type = MatchListActionTypes.LoadError;

    constructor(public payload: any) {
    }
}


export type MatchListActionUnion =
    | LoadMatchList
    | LoadMatchListSuccess
    | LoadMatchListError;
