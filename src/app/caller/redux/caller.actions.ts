import {Action} from '@ngrx/store';
import {Player} from '../../shared/data/player.model';
import {StatusDto} from '../../shared/statusdto.model';

export enum CallerActionTypes {
    Load = '[Referees] Load',
    LoadSuccess = '[Referees] Load Success',
    LoadError = '[Referees] Load Error',
    CallMatch = '[CallMatch]',
    CallMatchSuccess = '[CallMatch] Success',
    CallMatchError = '[CallMatch] Error',
    SetSelectedMatchAggregate = '[CallMatch] Set Selected Match'
}

export class LoadRefereesList implements Action {
    readonly type = CallerActionTypes.Load;

    constructor(public payload: any) {
    }
}

export class LoadRefereesListSuccess implements Action {
    readonly type = CallerActionTypes.LoadSuccess;

    constructor(public payload: Player[]) {
    }
}

export class LoadRefereesListError implements Action {
    readonly type = CallerActionTypes.LoadError;

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
    | LoadRefereesList
    | LoadRefereesListSuccess
    | LoadRefereesListError
    | CallMatch
    | CallMatchSuccess
    | CallMatchError
    | SetSelectedMatchAggregate;
