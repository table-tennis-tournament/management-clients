import {Action} from '@ngrx/store';
import {MatchList} from '../matchlist.model';
import {StatusDto} from '../../shared/statusdto.model';
import {MatchListItem} from '../matchlistitem.model';

export enum MatchListActionTypes {
    Load = '[Matchlist] Load',
    LoadSuccess = '[Matchlist] Load Success',
    LoadError = '[Matchlist] Load Error',
    Assign = '[Matchlist] Assign',
    AssignSuccess = '[Matchlist] Assign Success',
    AssignError = '[Matchlist] Assign Error',
    DeleteItem = '[Matchlist] Delete item',
    DeleteItemSuccess = '[Matchlist] Delete item Success',
    DeleteItemError = '[Matchlist] Delete item Error',
    MoveItem = '[Matchlist] Move item',
    MoveItemSuccess = '[Matchlist] Move item Success',
    MoveItemError = '[Matchlist] Move item Error'
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


export class AssignToMatchList implements Action {
    readonly type = MatchListActionTypes.Assign;

    constructor(public payload: MatchListItem) {
    }
}

export class AssignToMatchListSuccess implements Action {
    readonly type = MatchListActionTypes.AssignSuccess;

    constructor(public payload: StatusDto) {
    }
}

export class AssignToMatchListError implements Action {
    readonly type = MatchListActionTypes.AssignError;

    constructor(public payload: any) {
    }
}

export class DeleteMatchListItem implements Action {
    readonly type = MatchListActionTypes.DeleteItem;

    constructor(public payload: any) {
    }
}

export class DeleteMatchListItemSuccess implements Action {
    readonly type = MatchListActionTypes.DeleteItemSuccess;

    constructor(public payload: StatusDto) {
    }
}

export class DeleteMatchListItemError implements Action {
    readonly type = MatchListActionTypes.DeleteItemError;

    constructor(public payload: any) {
    }
}

export class MoveMatchListItem implements Action {
    readonly type = MatchListActionTypes.MoveItem;

    constructor(public payload: any) {
    }
}

export class MoveMatchListItemSuccess implements Action {
    readonly type = MatchListActionTypes.MoveItemSuccess;

    constructor(public payload: StatusDto) {
    }
}

export class MoveMatchListItemError implements Action {
    readonly type = MatchListActionTypes.MoveItemError;

    constructor(public payload: any) {
    }
}

export type MatchListActionUnion =
    | LoadMatchList
    | LoadMatchListSuccess
    | LoadMatchListError
    | AssignToMatchList
    | AssignToMatchListSuccess
    | AssignToMatchListError
    | DeleteMatchListItem
    | DeleteMatchListItemSuccess
    | DeleteMatchListItemError
    | MoveMatchListItem
    | MoveMatchListItemSuccess
    | MoveMatchListItemError;
