import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {DisciplineTabService} from '../services/discipline-tab.service';
import {MatchService} from '../services/match.service';
import {TypeService} from '../services/type.service';
import * as ResultActions from './result.actions';

@Injectable()
export class ResultEffects {

  loadTypes$ = createEffect(() => this.actions$.pipe(
    ofType(ResultActions.loadTypes),
    switchMap(() => this.typesService.getOpenTypes()
      .pipe(
        map(types => ResultActions.loadTypesSuccess({types})),
        catchError(() => of(ResultActions.loadTypesError()))
      )
    )
  ));

  loadTypesError$ = createEffect(() => this.actions$.pipe(
    ofType(ResultActions.loadTypesError),
    tap(() => {
      this.snackBar.open('Konkurrenzen konnten nicht abgerufen werden.');
    })
  ), {dispatch: false});


  loadMatches$ = createEffect(() => this.actions$.pipe(
    ofType(ResultActions.loadMatches),
    switchMap(({typeId}) => this.matchService.getMatchesByType(typeId)
      .pipe(
        map(matches => {
            const tab = this.tabService.getTabForMatches(matches);
            return ResultActions.loadMatchesSuccess({
              matches,
              groups: tab.groups,
              stages: tab.stages
            });
          }
        ),
        catchError(() => of(ResultActions.loadMatchesError()))
      )
    )
  ));

  loadMatchesError$ = createEffect(() => this.actions$.pipe(
    ofType(ResultActions.loadMatchesError),
    tap(() => {
      this.snackBar.open('Spiele konnten nicht abgerufen werden.');
    })
  ), {dispatch: false});

  constructor(
    private actions$: Actions,
    private snackBar: MatSnackBar,
    private matchService: MatchService,
    private tabService: DisciplineTabService,
    private typesService: TypeService) {
  }
}
