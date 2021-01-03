import {createAction, props} from '@ngrx/store';
import {DisciplineGroup} from '../data/discipline.group';
import {DisciplineStage} from '../data/discipline.stage';
import {Match} from '../data/match';
import {Type} from '../data/type';

export const loadTypes = createAction(
    '[Types] Load'
);

export const loadTypesSuccess = createAction(
    '[Types] Load Success',
    props<{ types: Type[] }>()
);

export const loadTypesError = createAction(
  '[Types] Load Error'
);

export const loadMatches = createAction(
  '[Matches] Load',
  props<{typeId}>()
);

export const loadMatchesSuccess = createAction(
  '[Matches] Load Success',
  props<{ matches: Match[], groups: DisciplineGroup[], stages: DisciplineStage[] }>()
);

export const loadMatchesError = createAction(
  '[Matches] Load Error'
);
