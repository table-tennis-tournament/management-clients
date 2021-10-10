import { Action } from '@ngrx/store';
import { Discipline } from '../discipline.model';

export enum DisciplineActionTypes {
  Load = '[Discipline] Load',
  LoadSuccess = '[Discipline] Load Success',
  LoadError = '[Discipline] Load Error',
}

export class LoadDiscipline implements Action {
  readonly type = DisciplineActionTypes.Load;

  constructor(public payload: any) {}
}

export class LoadDisciplineSuccess implements Action {
  readonly type = DisciplineActionTypes.LoadSuccess;

  constructor(public payload: Discipline[]) {}
}

export class LoadDisciplineError implements Action {
  readonly type = DisciplineActionTypes.LoadError;

  constructor(public payload: any) {}
}

export type DisciplineActionsUnion = LoadDiscipline | LoadDisciplineSuccess | LoadDisciplineError;
