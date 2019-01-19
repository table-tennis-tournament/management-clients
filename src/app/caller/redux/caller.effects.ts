import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
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
    LoadError,
    LoadRefereesListError,
    LoadRefereesListSuccess,
    LoadSuccess
} from './caller.actions';

@Injectable()
export class CallerEffects {

    @Effect()
    load$: Observable<Action> = this.actions$.pipe(
        ofType(CallerActionTypes.Load),
        switchMap(() => {
            return this.callerService
                .loadMatchAggregateForCaller().pipe(
                    map(matches => new LoadSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Ausrufermatches');
                        return of(new LoadError(err));
                    })
                );
        })
    );

    @Effect()
    loadRefereeList$: Observable<Action> = this.actions$.pipe(
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
    );

    @Effect()
    callMatch$: Observable<Action> = this.actions$.pipe(
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
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private callerService: CallerService) {

    }

}
