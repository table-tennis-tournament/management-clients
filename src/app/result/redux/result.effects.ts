import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {TypeService} from '../type.service';
import * as ResultActions from './result.actions';

@Injectable()
export class ResultEffects {

    loadTypes$ = createEffect(() => this.actions$.pipe(
        ofType(ResultActions.loadTypes),
        switchMap(() => this.typesService.getOpenTypes()
            .pipe(
                map(types => ResultActions.loadTypesSuccess({types})),
                catchError(() => of(ResultActions.loadTypesError({})))
            )
        )
    ));

    loadTypes$Error$ = createEffect(() => this.actions$.pipe(
        ofType(ResultActions.loadTypesError),
        tap(() => {
            this.snackBar.open('Konkurrenzen konnten nicht abgerufen werden.');
        })
    ), {dispatch: false});

    constructor(
        private actions$: Actions,
        private snackBar: MatSnackBar,
        private typesService: TypeService) {
    }
}
