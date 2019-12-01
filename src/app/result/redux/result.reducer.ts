import {Action, createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {Type} from '../data/type';
import * as TableActions from './result.actions';

export interface TypesState {
  types: Type[];
}

export const initialState: TypesState = {
  types: []
};

export interface AppState {
  disciplines: TypesState;
}

const typeReducer = createReducer(
  initialState,
  on(TableActions.loadTypesSuccess, (state, {types}) => ({
    ...state,
    types
  }))
);

export function reducer(state: TypesState | undefined, action: Action) {
  return typeReducer(state, action);
}

export const selectFeature = createFeatureSelector<AppState, TypesState>('disciplines');

export const getTypes = createSelector(
  selectFeature,
  (state: TypesState) => state.types
);
