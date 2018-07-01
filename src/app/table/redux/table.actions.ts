import {Action} from '@ngrx/store';
import {TableDto} from '../tabledto.model';

export enum TableActionTypes {
    Load = '[Table] Load',
    LoadSuccess = '[Table] Load Success',
    LoadError = '[Table] Load Error'
}

export class LoadTables implements Action {
    readonly type = TableActionTypes.Load;

    constructor() {}
}

export class LoadTablesSuccess implements Action {
    readonly type = TableActionTypes.LoadSuccess;

    constructor(public payload: TableDto[]) {}
}

export class LoadTablesError implements Action {
    readonly type = TableActionTypes.LoadError;

    constructor(public payload: string) {}
}

export type TableActionsUnion =
    | LoadTables
    | LoadTablesSuccess
    | LoadTablesError;