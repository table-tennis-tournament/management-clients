import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { LoadMatchListError, LoadMatchListSuccess } from '../../supervisor/redux/matchlist.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LoadResultsError, LoadResultsSuccess, ResultActionTypes } from './result.actions';
import { ToastrService } from 'ngx-toastr';
import { MatchService } from '../../assign/match.service';

@Injectable()
export class ResultEffects {
  loadResults = createEffect(() =>
    this.actions$.pipe(
      ofType(ResultActionTypes.Load),
      switchMap(() => {
        return this.matchService.loadPlayedMatches().pipe(
          map((matches) => new LoadResultsSuccess(matches)),
          catchError((err) => {
            this.toastService.error('Fehler beim Laden der Ergebnisliste');
            return of(new LoadResultsError(err));
          })
        );
      })
    )
  );

  constructor(private actions$: Actions, private toastService: ToastrService, private matchService: MatchService) {}
}
