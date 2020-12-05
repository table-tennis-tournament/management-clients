import {Action, createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {DisciplineGroup} from '../data/discipline.group';
import {DisciplineStage} from '../data/discipline.stage';
import {Match} from '../data/match';
import {Type} from '../data/type';
import * as TableActions from './result.actions';

export interface TypesState {
  types: Type[];
}

export const initialState: TypesState = {
  types: []
};

export interface MatchState {
  matches: Match[];
  groups: DisciplineGroup[];
  stages: DisciplineStage[];
}

export const initialMatchState: MatchState = {
  matches: [],
  groups: [],
  stages: []
};

export interface AppState {
  disciplines: TypesState;
  matches: MatchState;
}

const typeReducer = createReducer(
  initialState,
  on(TableActions.loadTypesSuccess, (state, {types}) => ({
    ...state,
    types
  }))
);

const matchesReducer = createReducer(
  initialMatchState,
  on(TableActions.loadMatchesSuccess, (state, {matches, groups, stages}) => ({
    ...state,
    matches,
    groups,
    stages
  }))
);

export function reducer(state: TypesState | undefined, action: Action) {
  return typeReducer(state, action);
}

export function matchReducer(state: MatchState | undefined, action: Action) {
  return matchesReducer(state, action);
}

export const selectFeature = createFeatureSelector<AppState, TypesState>('disciplines');
export const selectMatchFeature = createFeatureSelector<AppState, MatchState>('matches');

export const getTypes = createSelector(
  selectFeature,
  (state: TypesState) => state.types
);

export const getMatches = createSelector(
  selectMatchFeature,
  (state: MatchState) => state.matches
);

export const getStages = createSelector(
  selectMatchFeature,
  (state: MatchState) => state.stages
);

export const getGroups = createSelector(
  selectMatchFeature,
  (state: MatchState) => state.groups
);
