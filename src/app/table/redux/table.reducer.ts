import {TableDto} from '../tabledto.model';
import {TableActionsUnion, TableActionTypes} from './table.actions';

export interface TableState {
    tables: TableDto[];
    tablesLoading: boolean;
}


const initialState: TableState = {
    tables: [],
    tablesLoading: false
};

export function reduceTableState(state: TableState = initialState, action: TableActionsUnion){
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
                    if (table.number === action.payload) {
                        return {
                            ...table,
                            matches: [...table.matches],
                            isLocked: true
                        };
                    }
                    return table;
                })

            };
        case TableActionTypes.UnLockSuccess:
            return {
                ...state,
                tables: state.tables.map(table => {
                    if (table.number === action.payload) {
                        return {
                            ...table,
                            matches: [...table.matches],
                            isLocked: false
                        };
                    }
                    return table;
                })

            };
        case TableActionTypes.FreeSuccess:
            const freeTableEvent = action.payload;
            return {
                ...state,
                tables: state.tables.map(table => {
                    if (table.number === action.payload.tableNr) {
                        return {
                            ...table,
                            matches: [...table.matches.filter(match => !freeTableEvent.matchIds.indexOf(match.match.id))]
                        };
                    }
                    return table;
                })
            };
        case TableActionTypes.TakeBackSuccess:
            const takeBackEvent = action.payload;
            return {
                ...state,
                tables: state.tables.map(table => {
                    if (table.number === action.payload.tableNr) {
                        return {
                            ...table,
                            matches: [...table.matches.filter(match => !takeBackEvent.matchIds.indexOf(match.match.id))]
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
