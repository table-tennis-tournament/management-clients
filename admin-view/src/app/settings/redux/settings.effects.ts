import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
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
  SettingsActionTypes,
  LoadTypeColors,
  LoadTypeColorsSuccess,
  LoadTypeColorsError,
  SaveTypeColor,
  SaveTypeColorSuccess,
  SaveTypeColorError,
} from './settings.actions';
import { SettingsService } from '../settings.service';

@Injectable()
export class SettingsEffects {
  loadSettings = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActionTypes.Load),
      mergeMap(() => {
        return this.settingsService.loadSettings().pipe(
          map((settings) => new LoadSettingsSuccess(settings)),
          catchError((err) => {
            this.toastService.error('Fehler beim Laden der Settings');
            return of(new LoadSettingsError(err));
          })
        );
      })
    )
  );

  loadPrinters = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActionTypes.LoadPrinters),
      mergeMap(() => {
        return this.settingsService.loadPrinters().pipe(
          map((printers) => new LoadPrintersSuccess(printers)),
          catchError((err) => {
            this.toastService.error('Fehler beim Laden der Drucker');
            return of(new LoadPrintersError(err));
          })
        );
      })
    )
  );

  saveAssignAutomatically = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActionTypes.SaveAssignAutomatically),
      mergeMap((action: SaveAssignAutomatically) => {
        return this.settingsService.saveAssignAutomatically(action.payload).pipe(
          map(() => new SaveAssignAutomaticallySuccess(action.payload)),
          catchError((err) => {
            this.toastService.error('Fehler beim Speichern des automatischen zuweisens');
            return of(new SaveAssignAutomaticallyError(err));
          })
        );
      })
    )
  );

  savePrintOnAssign = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActionTypes.SavePrintOnAssign),
      mergeMap((action: SavePrintOnAssign) => {
        return this.settingsService.savePrintOnAssign(action.payload).pipe(
          map(() => new SavePrintOnAssignSuccess(action.payload)),
          catchError((err) => {
            this.toastService.error('Fehler beim Speichern des druckens bei aufruf');
            return of(new SavePrintOnAssignError(err));
          })
        );
      })
    )
  );

  setPrinter = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActionTypes.SetPrinter),
      mergeMap((action: SetPrinter) => {
        return this.settingsService.setPrinter(action.payload).pipe(
          map(() => new SetPrinterSuccess(action.payload)),
          catchError((err) => {
            this.toastService.error('Fehler beim setzen des Druckers');
            return of(new SetPrinterError(err));
          })
        );
      })
    )
  );

  loadTypeColors = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActionTypes.LoadTypeColors),
      mergeMap(() => {
        return this.settingsService.loadTypeColors().pipe(
          map((typeColors) => new LoadTypeColorsSuccess(typeColors)),
          catchError((err) => {
            this.toastService.error('Fehler beim Laden der Type-Farben');
            return of(new LoadTypeColorsError(err));
          })
        );
      })
    )
  );

  saveTypeColor = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActionTypes.SaveTypeColor),
      mergeMap((action: SaveTypeColor) => {
        return this.settingsService.saveTypeColor(action.payload.typeId, action.payload.colorData).pipe(
          map(() => {
            this.toastService.success('Type-Farbe gespeichert');
            return new SaveTypeColorSuccess(action.payload);
          }),
          catchError((err) => {
            this.toastService.error('Fehler beim Speichern der Type-Farbe');
            return of(new SaveTypeColorError(err));
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private toastService: ToastrService,
    private settingsService: SettingsService
  ) {}
}
