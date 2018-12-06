import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {
    LoadPrintersError,
    LoadPrintersSuccess,
    LoadSettingsError,
    LoadSettingsSuccess,
    SaveAssignAutomatically,
    SaveAssignAutomaticallyError,
    SaveAssignAutomaticallySuccess,
    SavePrintOnAssign,
    SavePrintOnAssignError,
    SavePrintOnAssignSuccess,
    SetPrinter,
    SetPrinterError,
    SetPrinterSuccess,
    SettingsActionTypes
} from './settings.actions';
import {SettingsService} from '../settings.service';

@Injectable()
export class SettingsEffects {

    @Effect()
    loadSettings$: Observable<Action> = this.actions$.pipe(
        ofType(SettingsActionTypes.Load),
        mergeMap(() => {
            return this.settingsService
                .loadSettings().pipe(
                    map(settings => new LoadSettingsSuccess(settings)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Settings', 'Error');
                        return of(new LoadSettingsError(err));
                    })
                );
        })
    );

    @Effect()
    loadPrinters$: Observable<Action> = this.actions$.pipe(
        ofType(SettingsActionTypes.LoadPrinters),
        mergeMap(() => {
            return this.settingsService
                .loadPrinters().pipe(
                    map(printers => new LoadPrintersSuccess(printers)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Drucker', 'Error');
                        return of(new LoadPrintersError(err));
                    })
                );
        })
    );

    @Effect()
    saveAssignAutomatically$: Observable<Action> = this.actions$.pipe(
        ofType(SettingsActionTypes.SaveAssignAutomatically),
        mergeMap((action: SaveAssignAutomatically) => {
            return this.settingsService
                .saveAssignAutomatically(action.payload).pipe(
                    map(() => new SaveAssignAutomaticallySuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Speichern des automatischen zuweisens', 'Error');
                        return of(new SaveAssignAutomaticallyError(err));
                    })
                );
        })
    );

    @Effect()
    savePrintOnAssign$: Observable<Action> = this.actions$.pipe(
        ofType(SettingsActionTypes.SavePrintOnAssign),
        mergeMap((action: SavePrintOnAssign) => {
            return this.settingsService
                .savePrintOnAssign(action.payload).pipe(
                    map(() => new SavePrintOnAssignSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Speichern des druckens bei aufruf', 'Error');
                        return of(new SavePrintOnAssignError(err));
                    })
                );
        })
    );

    @Effect()
    setPrinter$: Observable<Action> = this.actions$.pipe(
        ofType(SettingsActionTypes.SetPrinter),
        mergeMap((action: SetPrinter) => {
            return this.settingsService
                .setPrinter(action.payload).pipe(
                    map(() => new SetPrinterSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim setzen des Druckers', 'Error');
                        return of(new SetPrinterError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private settingsService: SettingsService) {

    }

}
