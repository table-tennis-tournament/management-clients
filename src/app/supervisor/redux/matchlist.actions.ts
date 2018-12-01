import {Action} from '@ngrx/store';
import {MatchList} from '../matchlist.model';

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

    constructor(public payload: MatchList[]) {
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
