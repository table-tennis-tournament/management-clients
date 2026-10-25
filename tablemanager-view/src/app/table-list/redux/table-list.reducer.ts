import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Table } from '../tt-table/table.model';
import * as TableActions from './table-list.actions';

export interface TablesState {
  tables: Table[];
  tableManagerId: number | null;
}

export const initialState: TablesState = {
  tables: [],
  tableManagerId: null,
};

export interface AppState {
  tables: TablesState;
}

const tableReducer = createReducer(
  initialState,
  on(TableActions.loadTables, (state, { tableManagerId }) => ({
    ...state,
    tableManagerId,
  })),
  on(TableActions.loadTablesSuccess, (state, { tables }) => ({
    ...state,
    tables,
  })),
  on(TableActions.updatedMatchToTable, (state, { tables }) => ({
    ...state,
    tables: state.tables.map((existingTable) => {
      const availableTable = tables.filter((tab) => tab.table_id === existingTable.table_id);
      if (availableTable.length > 0) {
        return availableTable[0];
      }
      return existingTable;
    }),
  }))
);

export function reducer(state: TablesState | undefined, action: Action) {
  return tableReducer(state, action);
}

export const selectFeature = createFeatureSelector<AppState, TablesState>('tables');

export const getTables = createSelector(selectFeature, (state: TablesState) => state.tables);

export const getTableManagerId = createSelector(selectFeature, (state: TablesState) => state.tableManagerId);
