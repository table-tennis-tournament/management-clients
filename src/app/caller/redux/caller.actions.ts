import {Action} from '@ngrx/store';
import {Player} from '../../shared/data/player.model';
import {StatusDto} from '../../shared/statusdto.model';
import {MatchAggregate} from '../../shared/data/match.aggregate';

export enum CallerActionTypes {
    Load = '[CallerMatches] Load',
    LoadSuccess = '[CallerMatches] Load Success',
    LoadError = '[CallerMatches] Load Error',
    LoadReferees = '[Referees] Load',
    LoadRefereesSuccess = '[Referees] Load Success',
    LoadRefereesError = '[Referees] Load Error',
    CallMatch = '[CallMatch]',
    CallMatchSuccess = '[CallMatch] Success',
    CallMatchError = '[CallMatch] Error',
    SetSelectedMatchAggregate = '[CallMatch] Set Selected Match'
}

export class Load implements Action {
    readonly type = CallerActionTypes.Load;

    constructor() {
    }
}

export class LoadSuccess implements Action {
    readonly type = CallerActionTypes.LoadSuccess;

    constructor(public payload: MatchAggregate[]) {
    }
}

export class LoadError implements Action {
    readonly type = CallerActionTypes.LoadError;

    constructor(public payload: any) {
    }
}

export class LoadRefereesList implements Action {
    readonly type = CallerActionTypes.LoadReferees;

    constructor(public payload: any) {
    }
}

export class LoadRefereesListSuccess implements Action {
    readonly type = CallerActionTypes.LoadRefereesSuccess;

    constructor(public payload: Player[]) {
    }
}

export class LoadRefereesListError implements Action {
    readonly type = CallerActionTypes.LoadRefereesError;

    constructor(public payload: any) {
    }
}

export class CallMatch implements Action {
    readonly type = CallerActionTypes.CallMatch;

    constructor(public payload: number[]) {
    }
}

export class CallMatchSuccess implements Action {
    readonly type = CallerActionTypes.CallMatchSuccess;

    constructor(public payload: StatusDto) {
    }
}

export class CallMatchError implements Action {
    readonly type = CallerActionTypes.CallMatchError;

    constructor(public payload: any) {
    }
}

export class SetSelectedMatchAggregate implements Action {
    readonly type = CallerActionTypes.SetSelectedMatchAggregate;

    constructor(public payload: any) {
    }
}

export type CallerActionUnion =
    | Load
    | LoadSuccess
    | LoadError
    | LoadRefereesList
    | LoadRefereesListSuccess
    | LoadRefereesListError
    | CallMatch
    | CallMatchSuccess
    | CallMatchError
    | SetSelectedMatchAggregate;
