import {Injectable} from '@angular/core';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CallerService} from '../caller.service';
import {
    CallerActionTypes,
    CallMatch,
    CallMatchError,
    CallMatchSuccess,
    LoadCallerMatchesError,
    LoadRefereesListError,
    LoadRefereesListSuccess,
    LoadCallerMatchesSuccess,
    LoadSecondCallMatchesSuccess,
    LoadSecondCallMatchesError,
    LoadThirdCallMatchesSuccess,
    LoadThirdCallMatchesError
} from './caller.actions';

@Injectable()
export class CallerEffects {

    load =  createEffect( () => this.actions$.pipe(
        ofType(CallerActionTypes.Load),
        switchMap(() => {
            return this.callerService
                .loadMatchAggregateForCaller().pipe(
                    map(matches => new LoadCallerMatchesSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Ausrufermatches');
                        return of(new LoadCallerMatchesError(err));
                    })
                );
        })
    ));

    loadRefereeList =  createEffect( () => this.actions$.pipe(
        ofType(CallerActionTypes.LoadReferees),
        switchMap(() => {
            return this.callerService
                .loadAvailableReferees().pipe(
                    map(matches => new LoadRefereesListSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Schiedsrichter');
                        return of(new LoadRefereesListError(err));
                    })
                );
        })
    ));

    loadSecondCallList =  createEffect( () => this.actions$.pipe(
        ofType(CallerActionTypes.LoadSecondCallMatches),
        switchMap(() => {
            return this.callerService
                .loadSecondCallMatches().pipe(
                    map(matches => new LoadSecondCallMatchesSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der 2. Aufruf Spiele');
                        return of(new LoadSecondCallMatchesError(err));
                    })
                );
        })
    ));

    loadThirdCallList =  createEffect( () => this.actions$.pipe(
        ofType(CallerActionTypes.LoadThirdCallMatches),
        switchMap(() => {
            return this.callerService
                .loadThirdCallMatches().pipe(
                    map(matches => new LoadThirdCallMatchesSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der 3. Aufruf Spiele');
                        return of(new LoadThirdCallMatchesError(err));
                    })
                );
        })
    ));

    callMatch =  createEffect( () => this.actions$.pipe(
        ofType(CallerActionTypes.CallMatch),
        switchMap((action: CallMatch) => {
            return this.callerService
                .callMatch(action.payload).pipe(
                    map(state => new CallMatchSuccess(state)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Ausrufen des Matches');
                        return of(new CallMatchError(err));
                    })
                );
        })
    ));


    constructor(private actions$: Actions,
                private toastService: ToastrService, private callerService: CallerService) {

    }

}
