import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
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

    constructor(
        private actions$: Actions,
        private matchService: MatchService) {
    }
}
