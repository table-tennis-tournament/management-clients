import {TableActionsUnion, TableActionTypes} from './table.actions';
import {TableDto} from '../tabledto.model';

export interface TableState {
    tables: TableDto[]
    tablesLoading: boolean;
}


const initialState: TableState = {
    tables: [],
    tablesLoading: false
};

export const reduceTableState = (state: TableState = initialState, action: TableActionsUnion) => {
    switch (action.type) {
        case TableActionTypes.Load:
            return {
                ...state,
                tablesLoading: true
            };
        case TableActionTypes.LoadSuccess:
            return {
                ...state,
                tablesLoading: false,
                tables: action.payload
            };
        case TableActionTypes.LoadError:
            return {
                ...state,
                tablesLoading: false
            };
        default:
            return state;
    }

};

export const getTables = (state: TableState) => state.tables;
export const getTablesLoading = (state: TableState) => state.tablesLoading;