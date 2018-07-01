import {TableActionsUnion, TableActionTypes} from './table.actions';
import {TableDto} from '../tabledto.model';

export interface TableState {
    tables: TableDto[]
}


const initialState: TableState = {
    tables: []
};

export const reduceTableState = (state: TableState = initialState, action: TableActionsUnion) => {
    switch (action.type) {
        case TableActionTypes.LoadSuccess:
            return {
                ...state,
                tables: action.payload
            };
        default:
            return state;
    }

};

export const getTables = (state: TableState) => state.tables;