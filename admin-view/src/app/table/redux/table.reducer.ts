import { Action } from '@ngrx/store';
import { TableDto } from '../tabledto.model';
import { TableActionsUnion, TableActionTypes } from './table.actions';
import { TTMatchResult } from '../table-list/result-modal/ttmatch-result.model';

export interface TableState {
  tables: TableDto[];
  tablesLoading: boolean;
}

const initialState: TableState = {
  tables: [],
  tablesLoading: false,
};

/** Every action reaches the reducer; it handles those of [TableActionsUnion]. */
export function reduceTableState(state: TableState = initialState, incoming: Action): TableState {
  const action = incoming as TableActionsUnion;
  switch (action.type) {
    case TableActionTypes.Load:
      return {
        ...state,
        tablesLoading: true,
      };
    case TableActionTypes.LoadSuccess:
      return {
        ...state,
        tablesLoading: false,
        tables: action.payload,
      };
    case TableActionTypes.LoadError:
      return {
        ...state,
        tablesLoading: false,
      };
    case TableActionTypes.LockSuccess:
      return {
        ...state,
        tables: state.tables.map((table) => {
          if (table.number === action.payload) {
            return {
              ...table,
              matches: [...table.matches],
              isLocked: true,
            };
          }
          return table;
        }),
      };
    case TableActionTypes.UnLockSuccess:
      return {
        ...state,
        tables: state.tables.map((table) => {
          if (table.number === action.payload) {
            return {
              ...table,
              matches: [...table.matches],
              isLocked: false,
            };
          }
          return table;
        }),
      };
    case TableActionTypes.ResultForMatchSuccess: {
      const resultForMatch: TTMatchResult = action.payload;
      return {
        ...state,
        tables: state.tables.map((table) => {
          return {
            ...table,
            matches: [...table.matches.filter((match) => resultForMatch.match.id !== match.id)],
          };
        }),
      };
    }
    case TableActionTypes.FreeSuccess: {
      const matchIds: number[] = action.payload.matchIds;
      return {
        ...state,
        tables: state.tables.map((table) => ({
          ...table,
          matches: table.matches.filter((match) => !matchIds.includes(match.id)),
        })),
      };
    }
    default:
      return state;
  }
}

export const getTables = (state: TableState) => state.tables;
export const getTablesLoading = (state: TableState) => state.tablesLoading;
