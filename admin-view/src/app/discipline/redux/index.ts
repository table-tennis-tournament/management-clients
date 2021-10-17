import * as fromDiscipline from './discipline.reducer';
import * as fromRoot from '../../app-state.reducer';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

export interface DisciplineState {
  disciplines: fromDiscipline.DisciplineState;
}

export interface State extends fromRoot.State {
  disciplines: DisciplineState;
}

export const reducers: ActionReducerMap<DisciplineState> = {
  disciplines: fromDiscipline.reduceDisciplineState,
};

export const selectPlayersState = createFeatureSelector<DisciplineState>('discipline');

export const selectPlayers = createSelector(selectPlayersState, (state) => state.disciplines);

export const getDisciplineState = createSelector(selectPlayers, fromDiscipline.getDisciplines);
export const getDisciplineLoading = createSelector(selectPlayers, fromDiscipline.getDisciplinesLoading);
