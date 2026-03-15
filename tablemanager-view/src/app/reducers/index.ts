import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '../../environments/environment';

export interface State {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
}

export const reducers: ActionReducerMap<State> = {};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
