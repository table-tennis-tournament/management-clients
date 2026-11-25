import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NotificationService } from '../../shared/notification.service';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CallerService } from '../caller.service';
import {
  CallerActionTypes,
  CallMatch,
  CallMatchError,
  CallMatchSuccess,
  LoadCallerMatches,
  LoadCallerMatchesError,
  LoadRefereesListError,
  LoadRefereesListSuccess,
  LoadCallerMatchesSuccess,
  LoadSecondCallMatchesSuccess,
  LoadSecondCallMatchesError,
  LoadThirdCallMatchesSuccess,
  LoadThirdCallMatchesError,
  LoadSecondCallMatches,
  LoadThirdCallMatches,
  SecondCallMatch,
  SecondCallMatchError,
  SecondCallMatchSuccess,
} from './caller.actions';

@Injectable()
export class CallerEffects {
  private actions$ = inject(Actions);
  private notifications = inject(NotificationService);
  private callerService = inject(CallerService);

  load = createEffect(() =>
    this.actions$.pipe(
      ofType(CallerActionTypes.Load),
      switchMap(() => {
        return this.callerService.loadMatchAggregateForCaller().pipe(
          map((matches) => new LoadCallerMatchesSuccess(matches)),
          catchError((err) => {
            this.notifications.error('Fehler beim Laden der Ausrufermatches');
            return of(new LoadCallerMatchesError(err));
          })
        );
      })
    )
  );

  loadRefereeList = createEffect(() =>
    this.actions$.pipe(
      ofType(CallerActionTypes.LoadReferees),
      switchMap(() => {
        return this.callerService.loadAvailableReferees().pipe(
          map((matches) => new LoadRefereesListSuccess(matches)),
          catchError((err) => {
            this.notifications.error('Fehler beim Laden der Schiedsrichter');
            return of(new LoadRefereesListError(err));
          })
        );
      })
    )
  );

  loadSecondCallList = createEffect(() =>
    this.actions$.pipe(
      ofType(CallerActionTypes.LoadSecondCallMatches),
      switchMap(() => {
        return this.callerService.loadSecondCallMatches().pipe(
          map((matches) => new LoadSecondCallMatchesSuccess(matches)),
          catchError((err) => {
            this.notifications.error('Fehler beim Laden der 2. Aufruf Spiele');
            return of(new LoadSecondCallMatchesError(err));
          })
        );
      })
    )
  );

  loadThirdCallList = createEffect(() =>
    this.actions$.pipe(
      ofType(CallerActionTypes.LoadThirdCallMatches),
      switchMap(() => {
        return this.callerService.loadThirdCallMatches().pipe(
          map((matches) => new LoadThirdCallMatchesSuccess(matches)),
          catchError((err) => {
            this.notifications.error('Fehler beim Laden der 3. Aufruf Spiele');
            return of(new LoadThirdCallMatchesError(err));
          })
        );
      })
    )
  );

  /** The caller announced a requested Second or Third call: both lists change, the card shows the next one. */
  announceRequestedCall = createEffect(() =>
    this.actions$.pipe(
      ofType(CallerActionTypes.SecondCallMatch),
      switchMap((action: SecondCallMatch) => {
        return this.callerService.announceRequestedCalls(action.payload).pipe(
          switchMap((state) => [
            new SecondCallMatchSuccess(state),
            new LoadSecondCallMatches(),
            new LoadThirdCallMatches(),
          ]),
          catchError((err) => {
            this.notifications.error('Fehler beim Ausrufen der Spieler');
            return of(new SecondCallMatchError(err));
          })
        );
      })
    )
  );

  callMatch = createEffect(() =>
    this.actions$.pipe(
      ofType(CallerActionTypes.CallMatch),
      switchMap((action: CallMatch) => {
        return this.callerService.callMatch(action.payload).pipe(
          switchMap((state) => [new CallMatchSuccess(state), new LoadCallerMatches()]),
          catchError((err) => {
            this.notifications.error('Fehler beim Ausrufen des Matches');
            return of(new CallMatchError(err));
          })
        );
      })
    )
  );
}
