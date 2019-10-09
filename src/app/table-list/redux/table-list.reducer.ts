import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {Table} from '../tt-table/table.model';
import * as TableActions from './table-list.actions';
import { matchAssignedToTable } from './table-list.actions';

export interface TablesState {
    tables: Table[];
}

export const initialState: TablesState = {
    tables: [],
};

export interface AppState {
    tables: TablesState;
}

export const tableReducer = createReducer(
    initialState,
    on(TableActions.loadTablesSuccess, (state, {tables}) => ({
        ...state,
        tables
    })),
    on(TableActions.matchAssignedToTable, (state, {table}) => ({
        ...state,
        tables: state.tables.map(existingTable => {
            if(existingTable.table_id === table.table_id) {
                return table;
            } else {
                return existingTable;
            }
        })
    })),
);

export const selectFeature = createFeatureSelector<AppState, TablesState>('tables');

export const getTables = createSelector(
    selectFeature,
    (state: TablesState) => state.tables
);
