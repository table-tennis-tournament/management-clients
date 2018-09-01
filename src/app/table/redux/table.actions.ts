import {Action} from '@ngrx/store';
import {StatusDto} from '../../shared/statusdto.model';
import {TableDto} from '../tabledto.model';

export enum TableActionTypes {
    Load = '[Table] Load',
    LoadSuccess = '[Table] Load Success',
    LoadError = '[Table] Load Error',
    Lock = '[Table] Lock',
    LockSuccess = '[Table] Lock Success',
    LockError = '[Table] Lock Error',
    UnLock = '[Table] UnLock',
    UnLockSuccess = '[Table] UnLock Success',
    UnLockError = '[Table] UnLock Error'
}

export class LoadTables implements Action {
    readonly type = TableActionTypes.Load;

    constructor(public payload: any) {}
}

export class LoadTablesSuccess implements Action {
    readonly type = TableActionTypes.LoadSuccess;

    constructor(public payload: TableDto[]) {}
}

export class LoadTablesError implements Action {
    readonly type = TableActionTypes.LoadError;

    constructor(public payload: any) {}
}

export class LockTable implements Action {
    readonly type = TableActionTypes.Lock;

    constructor(public payload: number) {}
}

export class LockTableSuccess implements Action {
    readonly type = TableActionTypes.LockSuccess;

    constructor(public payload: number) {}
}

export class LockTableError implements Action {
    readonly type = TableActionTypes.LockError;

    constructor(public payload: any) {}
}

export class UnLockTable implements Action {
    readonly type = TableActionTypes.UnLock;

    constructor(public payload: number) {}
}

export class UnLockTableSuccess implements Action {
    readonly type = TableActionTypes.UnLockSuccess;

    constructor(public payload: number) {}
}

export class UnLockTableError implements Action {
    readonly type = TableActionTypes.UnLockError;

    constructor(public payload: number) {}
}

export type TableActionsUnion =
    | LoadTables
    | LoadTablesSuccess
    | LoadTablesError
    | LockTable
    | LockTableSuccess
    | LockTableError
    | UnLockTable
    | UnLockTableSuccess
    | UnLockTableError;
