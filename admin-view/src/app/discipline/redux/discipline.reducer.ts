import { Action } from '@ngrx/store';
import { DisciplineActionsUnion, DisciplineActionTypes } from './discipline.actions';
import { Discipline } from '../discipline.model';

export interface DisciplineState {
  disciplines: Discipline[];
  disciplinesLoading: boolean;
}

const initialState: DisciplineState = {
  disciplines: [],
  disciplinesLoading: false,
};

/** Every action reaches the reducer; it handles those of [DisciplineActionsUnion]. */
export function reduceDisciplineState(state: DisciplineState = initialState, incoming: Action): DisciplineState {
  const action = incoming as DisciplineActionsUnion;
  switch (action.type) {
    case DisciplineActionTypes.Load:
      return {
        ...state,
        disciplinesLoading: true,
      };
    case DisciplineActionTypes.LoadSuccess:
      return {
        ...state,
        disciplinesLoading: false,
        disciplines: action.payload,
      };
    case DisciplineActionTypes.LoadError:
      return {
        ...state,
        disciplinesLoading: false,
      };
    default:
      return state;
  }
}

export const getDisciplines = (state: DisciplineState) => state.disciplines;
export const getDisciplinesLoading = (state: DisciplineState) => state.disciplinesLoading;
