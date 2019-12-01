import {createAction, props} from '@ngrx/store';
import {Type} from '../data/type';

export const loadTypes = createAction(
    '[Types] Load',
    props<{}>()
);

export const loadTypesSuccess = createAction(
    '[Types] Load Success',
    props<{ types: Type[] }>()
);

export const loadTypesError = createAction(
  '[Types] Load Error',
  props<{}>()
);
