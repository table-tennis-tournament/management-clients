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
    LoadSecondCallMatches = '[SecondCall] Load',
    LoadSecondCallMatchesSuccess = '[SecondCall] Load Success',
    LoadSecondCallMatchesError = '[SecondCall] Load Error',
    LoadThirdCallMatches = '[ThirdCall] Load',
    LoadThirdCallMatchesSuccess = '[ThirdCall] Load Success',
    LoadThirdCallMatchesError = '[ThirdCall] Load Error',
    CallMatch = '[CallMatch]',
    CallMatchSuccess = '[CallMatch] Success',
    CallMatchError = '[CallMatch] Error',
    SetSelectedMatchAggregate = '[CallMatch] Set Selected Match'
}

export class LoadCallerMatches implements Action {
    readonly type = CallerActionTypes.Load;

    constructor() {
    }
}

export class LoadCallerMatchesSuccess implements Action {
    readonly type = CallerActionTypes.LoadSuccess;

    constructor(public payload: MatchAggregate[]) {
    }
}

export class LoadCallerMatchesError implements Action {
    readonly type = CallerActionTypes.LoadError;

    constructor(public payload: any) {
    }
}

export class LoadSecondCallMatches implements Action {
    readonly type = CallerActionTypes.LoadSecondCallMatches;

    constructor() {
    }
}

export class LoadSecondCallMatchesSuccess implements Action {
    readonly type = CallerActionTypes.LoadSecondCallMatchesSuccess;

    constructor(public payload: MatchAggregate[]) {
    }
}

export class LoadSecondCallMatchesError implements Action {
    readonly type = CallerActionTypes.LoadSecondCallMatchesError;

    constructor(public payload: any) {
    }
}

export class LoadThirdCallMatches implements Action {
    readonly type = CallerActionTypes.LoadThirdCallMatches;

    constructor() {
    }
}

export class LoadThirdCallMatchesSuccess implements Action {
    readonly type = CallerActionTypes.LoadThirdCallMatchesSuccess;

    constructor(public payload: MatchAggregate[]) {
    }
}

export class LoadThirdCallMatchesError implements Action {
    readonly type = CallerActionTypes.LoadThirdCallMatchesError;

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
    | LoadCallerMatches
    | LoadCallerMatchesSuccess
    | LoadCallerMatchesError
    | LoadRefereesList
    | LoadRefereesListSuccess
    | LoadRefereesListError
    | CallMatch
    | CallMatchSuccess
    | CallMatchError
    | LoadSecondCallMatches
    | LoadSecondCallMatchesSuccess
    | LoadSecondCallMatchesError
    | LoadThirdCallMatches
    | LoadThirdCallMatchesSuccess
    | LoadThirdCallMatchesError
    | SetSelectedMatchAggregate;
