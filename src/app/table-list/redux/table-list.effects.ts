import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {TableService} from '../table.service';
import * as TableActions from './table-list.actions';

@Injectable()
export class TableListEffects {

    loadTables$ = createEffect(() => this.actions$.pipe(
        ofType(TableActions.loadTables),
        switchMap(({tableManagerId}) => this.tableService.getTables(tableManagerId)
            .pipe(
                map(tables => TableActions.loadTablesSuccess({tables})),
                catchError(() => of(TableActions.loadTablesError({})))
            )
        )
    ));

    constructor(
        private actions$: Actions,
        private tableService: TableService) {
    }
}
