import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import * as TableActions from '../../redux/table-list.actions';
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
            this.snackBar.open('Match could not be updated.');
        })
    ), {dispatch: false});

    constructor(
        private actions$: Actions,
        private snackBar: MatSnackBar,
        private matchService: MatchService) {
    }
}
