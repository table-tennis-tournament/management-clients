import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {MatchService} from '../match.service';
import {LoadMatchesError, LoadMatchesSuccess, MatchActionTypes} from './matchlist.actions';

@Injectable()
export class MatchlistEffects {

    @Effect()
    loadMatches$: Observable<Action> = this.actions$.pipe(
        ofType(MatchActionTypes.Load),
        mergeMap(() => {
            return this.matchService
                .loadAllMatches().pipe(
                    map(matches => new LoadMatchesSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Matches', 'Error');
                        return of(new LoadMatchesError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private matchService: MatchService) {

    }

}
