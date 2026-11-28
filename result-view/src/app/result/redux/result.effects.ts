import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { forkJoin, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { DisciplineTabService } from '../services/discipline-tab.service';
import { MatchService } from '../services/match.service';
import { TypeService } from '../services/type.service';
import * as ResultActions from './result.actions';
import { AppState, getSelectedTypeId } from './result.reducer';

@Injectable()
export class ResultEffects {
  loadTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResultActions.loadTypes),
      switchMap(() =>
        this.typesService.getOpenTypes().pipe(
          map((types) => ResultActions.loadTypesSuccess({ types })),
          catchError(() => of(ResultActions.loadTypesError()))
        )
      )
    )
  );

  loadTypesError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ResultActions.loadTypesError),
        tap(() => {
          this.snackBar.open('Konkurrenzen konnten nicht abgerufen werden.');
        })
      ),
    { dispatch: false }
  );

  /** Loads the matches of the displayed discipline whenever the selection or the types change. */
  loadSelectedMatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResultActions.selectType, ResultActions.loadTypesSuccess),
      withLatestFrom(this.store.select(getSelectedTypeId)),
      map(([, typeId]) => typeId),
      filter((typeId): typeId is number => typeId != null),
      map((typeId) => ResultActions.loadMatches({ typeId }))
    )
  );

  loadMatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ResultActions.loadMatches),
      switchMap(({ typeId }) =>
        forkJoin({
          matches: this.matchService.getMatchesByType(typeId),
          // the matches are shown without standings when these do not load
          standings: this.matchService.getStandings(typeId).pipe(catchError(() => of([]))),
        }).pipe(
          map(({ matches, standings }) => {
            const tab = this.tabService.getTabForMatches(matches);
            return ResultActions.loadMatchesSuccess({
              matches,
              groups: this.tabService.withStandings(tab.groups, standings),
              stages: tab.stages,
            });
          }),
          catchError(() => of(ResultActions.loadMatchesError()))
        )
      )
    )
  );

  loadMatchesError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ResultActions.loadMatchesError),
        tap(() => {
          this.snackBar.open('Spiele konnten nicht abgerufen werden.');
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private matchService: MatchService,
    private tabService: DisciplineTabService,
    private typesService: TypeService
  ) {}
}
