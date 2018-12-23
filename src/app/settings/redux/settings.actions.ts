import {Action} from '@ngrx/store';

export enum SettingsActionTypes {
    Load = '[Settings] Load',
    LoadSuccess = '[Settings] Load Success',
    LoadError = '[Settings] Load Error'
}

export class LoadSettings implements Action {
    readonly type = SettingsActionTypes.Load;

    constructor(public payload: any) {
    }
}

export class LoadSettingsSuccess implements Action {
    readonly type = SettingsActionTypes.LoadSuccess;

    constructor(public payload: any[]) {
    }
}

export class LoadSettingsError implements Action {
    readonly type = SettingsActionTypes.LoadError;

    constructor(public payload: any) {
    }
}


export type SettingsActionUnion =
    | LoadSettings
    | LoadSettingsSuccess
    | LoadSettingsError;
