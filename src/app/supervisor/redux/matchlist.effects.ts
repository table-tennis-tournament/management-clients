import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {
    LoadMatchesError,
    LoadMatchesSuccess,
    LoadMatchListError,
    LoadMatchListSuccess,
    MatchActionTypes,
    MatchListActionTypes
} from './matchlist.actions';
import {MatchListService} from '../matchlist.service';

@Injectable()
export class MatchListEffects {

    @Effect()
    loadMatchList$: Observable<Action> = this.actions$.pipe(
        ofType(MatchListActionTypes.Load),
        mergeMap(() => {
            return this.matchListService
                .loadAllMatchListItems().pipe(
                    map(matches => new LoadMatchListSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der MatchList', 'Error');
                        return of(new LoadMatchListError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private matchListService: MatchListService) {

    }

}
