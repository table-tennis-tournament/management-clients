import {TableDto} from '../tabledto.model';
import {TableActionsUnion, TableActionTypes} from './table.actions';

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
        case TableActionTypes.LockSuccess:
            return {
                ...state,
                tables: state.tables.map(table => {
                    if (table.table.number === action.payload) {
                        return {
                            matchinfo: [...table.matchinfo],
                            table: {
                                ...table.table,
                                isLocked: true
                            }
                        };
                    }
                    return table;
                })

            };
            case TableActionTypes.UnLockSuccess:
            return {
                ...state,
                tables: state.tables.map(table => {
                    if (table.table.number === action.payload) {
                        return {
                            matchinfo: [...table.matchinfo],
                            table: {
                                ...table.table,
                                isLocked: false
                            }
                        };
                    }
                    return table;
                })

            };
        default:
            return state;
    }

};

export const getTables = (state: TableState) => state.tables;
export const getTablesLoading = (state: TableState) => state.tablesLoading;