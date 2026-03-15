import { Injectable, inject } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {TableService} from '../table.service';
import * as TableActions from './table-list.actions';

@Injectable()
export class TableListEffects {
    private actions$ = inject(Actions);
    private snackBar = inject(MatSnackBar);
    private tableService = inject(TableService);


    loadTables$ = createEffect(() => this.actions$.pipe(
        ofType(TableActions.loadTables),
        switchMap(({tableManagerId}) => this.tableService.getTables(tableManagerId)
            .pipe(
                map(tables => TableActions.loadTablesSuccess({tables})),
                catchError(() => of(TableActions.loadTablesError()))
            )
        )
    ));

    loadTablesError$ = createEffect(() => this.actions$.pipe(
        ofType(TableActions.loadTablesError),
        tap(() => {
            this.snackBar.open('Tables could not be loaded.');
        })
    ), {dispatch: false});
}
