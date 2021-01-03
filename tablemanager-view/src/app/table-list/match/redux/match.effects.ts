import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {MatchService} from '../match.service';
import * as MatchActions from './match.actions';

@Injectable()
export class MatchEffects {

  updateMatchResult$ = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.updateMatchResult),
    switchMap(({matchId, result}) => this.matchService.updateMatchResult(matchId, result)
      .pipe(
        map(() => MatchActions.updateMatchResultSuccess({})),
        catchError(() => of(MatchActions.updateMatchResultError({})))
      )
    )
  ));

  updateMatchResultError$ = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.updateMatchResultError),
    tap(() => {
      this.snackBar.open('Ergebnis konnte nicht eingetragen werden.');
    })
  ), {dispatch: false});

  finishMatch = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.finishMatch),
    switchMap(({matchId, result}) => this.matchService.finishMatch(matchId, result)
      .pipe(
        map(() => MatchActions.finishMatchSuccess({})),
        catchError(() => of(MatchActions.finishMatchError({})))
      )
    )
  ));

  finishMatchError$ = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.finishMatchError),
    tap(() => {
      this.snackBar.open('Ergebnis nicht vollständig.');
    })
  ), {dispatch: false});

  startMatch = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.startMatchOnTable),
    switchMap(({tableId, matchId}) => this.matchService.startMatch(tableId, matchId)
      .pipe(
        map(() => MatchActions.startMatchOnTableSuccess({})),
        catchError(() => of(MatchActions.startMatchOnTableError({})))
      )
    )
  ));

  startMatchError$ = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.startMatchOnTableError),
    tap(() => {
      this.snackBar.open('Spiel konnte nicht gestartet werden');
    })
  ), {dispatch: false});


  callPlayerForMatch = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.callPlayerForMatch),
    switchMap(({playerIds, matchId}) => this.matchService.callPlayersForMatch(playerIds, matchId)
      .pipe(
        map(() => MatchActions.callPlayerForMatchSuccess({})),
        catchError(() => of(MatchActions.callPlayerForMatchError({})))
      )
    )
  ));

  callPlayerForMatchError$ = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.callPlayerForMatchError),
    tap(() => {
      this.snackBar.open('Spieler konnte nicht ausgerufen werden');
    })
  ), {dispatch: false});


  takeBackMatch$ = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.takeBackMatch),
    switchMap(({matchId}) => this.matchService.takeBackMatch(matchId)
      .pipe(
        map(() => MatchActions.takeBackMatchSuccess({})),
        catchError(() => of(MatchActions.takeBackMatchError({})))
      )
    )
  ));

  takeBackMatchError$ = createEffect(() => this.actions$.pipe(
    ofType(MatchActions.takeBackMatchError),
    tap(() => {
      this.snackBar.open('Spiel konnte nicht zurück genommen werden.');
    })
  ), {dispatch: false});



  constructor(
    private actions$: Actions,
    private snackBar: MatSnackBar,
    private matchService: MatchService) {
  }
}
