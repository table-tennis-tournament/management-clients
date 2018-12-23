import {Action} from '@ngrx/store';

export enum SettingsActionTypes {
    Load = '[Settings] Load',
    LoadSuccess = '[Settings] Load Success',
    LoadError = '[Settings] Load Error',
    LoadPrinters = '[Settings] Printers Load',
    LoadPrintersSuccess = '[Settings] Printers Load Success',
    LoadPrintersError = '[Settings] Printers Load Error',
    SaveAssignAutomatically = '[Settings] Save Assign Automatically',
    SaveAssignAutomaticallySuccess = '[Settings] Save Assign Automatically Success',
    SaveAssignAutomaticallyError = '[Settings] Save Assign Automatically Error',
    SavePrintOnAssign = '[Settings] SavePrintOnAssign',
    SavePrintOnAssignSuccess = '[Settings]SavePrintOnAssign Success',
    SavePrintOnAssignError = '[Settings] SavePrintOnAssign Error',
    SetPrinter = '[Settings] SetPrinter',
    SetPrinterSuccess = '[Settings]SetPrinter Success',
    SetPrinterError = '[Settings] SetPrinter Error'
}

export class LoadSettings implements Action {
    readonly type = SettingsActionTypes.Load;

    constructor() {
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

export class LoadPrinters implements Action {
    readonly type = SettingsActionTypes.LoadPrinters;

    constructor() {
    }
}

export class LoadPrintersSuccess implements Action {
    readonly type = SettingsActionTypes.LoadPrintersSuccess;

    constructor(public payload: string[]) {
    }
}

export class LoadPrintersError implements Action {
    readonly type = SettingsActionTypes.LoadPrintersError;

    constructor(public payload: any) {
    }
}

export class SaveAssignAutomatically implements Action {
    readonly type = SettingsActionTypes.SaveAssignAutomatically;

    constructor(public payload: any) {
    }
}

export class SaveAssignAutomaticallySuccess implements Action {
    readonly type = SettingsActionTypes.SaveAssignAutomaticallySuccess;

    constructor(public payload: any) {
    }
}

export class SaveAssignAutomaticallyError implements Action {
    readonly type = SettingsActionTypes.SaveAssignAutomaticallyError;

    constructor(public payload: any) {
    }
}

export class SavePrintOnAssign implements Action {
    readonly type = SettingsActionTypes.SavePrintOnAssign;

    constructor(public payload: any) {
    }
}

export class SavePrintOnAssignSuccess implements Action {
    readonly type = SettingsActionTypes.SavePrintOnAssignSuccess;

    constructor(public payload: any) {
    }
}

export class SavePrintOnAssignError implements Action {
    readonly type = SettingsActionTypes.SavePrintOnAssignError;

    constructor(public payload: any) {
    }
}

export class SetPrinter implements Action {
    readonly type = SettingsActionTypes.SetPrinter;

    constructor(public payload: string) {
    }
}

export class SetPrinterSuccess implements Action {
    readonly type = SettingsActionTypes.SetPrinterSuccess;

    constructor(public payload: string) {
    }
}

export class SetPrinterError implements Action {
    readonly type = SettingsActionTypes.SetPrinterError;

    constructor(public payload: any) {
    }
}


export type SettingsActionUnion =
    | LoadSettings
    | LoadSettingsSuccess
    | LoadSettingsError
    | LoadPrinters
    | LoadPrintersSuccess
    | LoadPrintersError
    | SaveAssignAutomatically
    | SaveAssignAutomaticallySuccess
    | SaveAssignAutomaticallyError
    | SavePrintOnAssign
    | SavePrintOnAssignSuccess
    | SavePrintOnAssignError
    | SetPrinter
    | SetPrinterSuccess
    | SetPrinterError;
