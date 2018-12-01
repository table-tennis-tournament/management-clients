import {Action} from '@ngrx/store';
import {Match} from '../../shared/data/match.model';

export enum MatchActionTypes {
    Load = '[Match] Load',
    LoadSuccess = '[Match] Load Success',
    LoadError = '[Match] Load Error'
}

export class LoadMatches implements Action {
    readonly type = MatchActionTypes.Load;

    constructor(public payload: any) {
    }
}

export class LoadMatchesSuccess implements Action {
    readonly type = MatchActionTypes.LoadSuccess;

    constructor(public payload: Match[]) {
    }
}

export class LoadMatchesError implements Action {
    readonly type = MatchActionTypes.LoadError;

    constructor(public payload: any) {
    }
}


export type MatchActionsUnion =
    | LoadMatches
    | LoadMatchesSuccess
    | LoadMatchesError;
