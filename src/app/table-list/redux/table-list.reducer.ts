import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {Table} from '../tt-table/table.model';
import * as TableActions from './table-list.actions';

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
);

export const selectFeature = createFeatureSelector<AppState, TablesState>('tables');

export const getTables = createSelector(
    selectFeature,
    (state: TablesState) => state.tables
);
