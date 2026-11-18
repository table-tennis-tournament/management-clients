import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, timer } from 'rxjs';
import { catchError, map, retry, switchMap } from 'rxjs/operators';
import { TableService } from '../table.service';
import * as TableActions from './table-list.actions';

/** A failed load is retried this many times, [LOAD_RETRY_DELAY_MS] apart, before it counts as an error. */
export const LOAD_RETRIES = 2;
export const LOAD_RETRY_DELAY_MS = 2000;

@Injectable()
export class TableListEffects {
  private actions$ = inject(Actions);
  private snackBar = inject(MatSnackBar);
  private tableService = inject(TableService);

  loadTables$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TableActions.loadTables),
      switchMap(({ tableManagerId }) =>
        this.tableService.getTables(tableManagerId).pipe(
          retry({ count: LOAD_RETRIES, delay: () => timer(LOAD_RETRY_DELAY_MS) }),
          map((tables) => TableActions.loadTablesSuccess({ tables })),
          catchError(() => of(TableActions.loadTablesError({ tableManagerId })))
        )
      )
    )
  );

  /** Tells the table manager and offers to load the tables again. */
  loadTablesError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TableActions.loadTablesError),
      switchMap(({ tableManagerId }) =>
        this.snackBar
          .open('Die Tische konnten nicht geladen werden.', 'Erneut laden')
          .onAction()
          .pipe(map(() => TableActions.loadTables({ tableManagerId })))
      )
    )
  );
}
