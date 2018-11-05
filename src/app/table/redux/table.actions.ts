import {Action} from '@ngrx/store';
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
    UnLockError = '[Table] UnLock Error',
    Free = '[Table] Free',
    FreeSuccess = '[Table] Free Success',
    FreeError = '[Table] Free Error',
    TakeBack = '[Table] Take Back',
    TakeBackSuccess = '[Table] Take Back Success',
    TakeBackError = '[Table] Take Back Error',
    PrintTable = '[Table] Print',
    PrintTableError = '[Table] Print Error',
    PrintTableSuccess = '[Table] Print Success',
    AssignToSecondTable = '[Table] Assign to 2nd table',
    AssignToSecondTableError = '[Table] Assign to 2nd table Error',
    AssignToSecondTableSuccess = '[Table] Assign to 2nd table Success'
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

export class FreeTable implements Action {
    readonly type = TableActionTypes.Free;

    constructor(public payload: any) {
    }
}

export class FreeTableSuccess implements Action {
    readonly type = TableActionTypes.FreeSuccess;

    constructor(public payload: any) {
    }
}

export class FreeTableError implements Action {
    readonly type = TableActionTypes.FreeError;

    constructor(public payload: any) {
    }
}

export class TakeBackTable implements Action {
    readonly type = TableActionTypes.TakeBack;

    constructor(public payload: any) {
    }
}

export class TakeBackTableSuccess implements Action {
    readonly type = TableActionTypes.TakeBackSuccess;

    constructor(public payload: any) {
    }
}

export class TakeBackTableError implements Action {
    readonly type = TableActionTypes.TakeBackError;

    constructor(public payload: any) {
    }
}

export class PrintTable implements Action {
    readonly type = TableActionTypes.PrintTable;

    constructor(public payload: any) {
    }
}

export class PrintTableSuccess implements Action {
    readonly type = TableActionTypes.PrintTableSuccess;

    constructor(public payload: any) {
    }
}

export class PrintTableError implements Action {
    readonly type = TableActionTypes.PrintTableError;

    constructor(public payload: any) {
    }
}

export class AssignToSecondTable implements Action {
    readonly type = TableActionTypes.AssignToSecondTable;

    constructor(public payload: any) {
    }
}

export class AssignToSecondTableSuccess implements Action {
    readonly type = TableActionTypes.AssignToSecondTableSuccess;

    constructor(public payload: any) {
    }
}

export class AssignToSecondTableError implements Action {
    readonly type = TableActionTypes.AssignToSecondTableError;

    constructor(public payload: any) {
    }
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
    | UnLockTableError
    | FreeTable
    | FreeTableSuccess
    | FreeTableError
    | TakeBackTable
    | TakeBackTableSuccess
    | TakeBackTableError
    | PrintTable
    | PrintTableSuccess
    | PrintTableError
    | AssignToSecondTable
    | AssignToSecondTableSuccess
    | AssignToSecondTableError;
