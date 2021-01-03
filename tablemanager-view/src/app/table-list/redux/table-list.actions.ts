import {createAction, props} from '@ngrx/store';
import {Table} from '../tt-table/table.model';

export const loadTables = createAction(
    '[Tables] Load',
    props<{ tableManagerId: number }>()
);

export const loadTablesSuccess = createAction(
    '[Tables] Load Success',
    props<{ tables: Table[] }>()
);

export const updatedMatchToTable = createAction(
    '[Tables] UpdatedMatchToTable',
    props<{ tables: Table[] }>()
);

export const loadTablesError = createAction(
    '[Tables] Load Tables Error'
);
