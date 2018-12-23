import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {MatchService} from '../match.service';
import {LoadMatchesError, LoadMatchesSuccess, MatchActionTypes, ReloadMatchesError, ReloadMatchesSuccess} from './match.actions';

@Injectable()
export class MatchEffects {

    @Effect()
    loadMatches$: Observable<Action> = this.actions$.pipe(
        ofType(MatchActionTypes.Load),
        switchMap(() => {
            return this.matchService
                .loadAllMatches().pipe(
                    map(matches => new LoadMatchesSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Matches', '');
                        return of(new LoadMatchesError(err));
                    })
                );
        })
    );

    @Effect()
    reloadMatches$: Observable<Action> = this.actions$.pipe(
        ofType(MatchActionTypes.Reload),
        switchMap(() => {
            return this.matchService
                .reloadMatchesFromDb().pipe(
                    map(matches => {
                        this.toastService.success('Daten erfolgreich geladen', '');
                        return new ReloadMatchesSuccess(matches);
                    }),
                    catchError(err => {
                        this.toastService.error('Fehler beim Lesen der Matches aus der DB', '');
                        return of(new ReloadMatchesError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private matchService: MatchService) {

    }

}
