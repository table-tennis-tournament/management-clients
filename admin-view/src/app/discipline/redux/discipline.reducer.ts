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

export function reduceDisciplineState(state: DisciplineState = initialState, action: DisciplineActionsUnion) {
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
