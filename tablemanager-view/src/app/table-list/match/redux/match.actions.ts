import {createAction, props} from '@ngrx/store';
import {Result} from '../result.model';

export const updateMatchResult = createAction(
  '[Match] Update Match Result',
  props<{ matchId: number, result: Result }>()
);

export const updateMatchResultSuccess = createAction(
  '[Match] Update Match Result Success'
);

export const updateMatchResultError = createAction(
  '[Match] Update Match Result Error'
);

export const finishMatch = createAction(
  '[Match] Finish Match',
  props<{ matchId: number, result: Result }>()
);

export const finishMatchSuccess = createAction(
  '[Match] Finish Match Success'
);

export const finishMatchError = createAction(
  '[Match] Finish Match Error'
);

export const startMatchOnTable = createAction(
  '[Match] Start Match',
  props<{ tableId: number, matchId: number }>()
);

export const startMatchOnTableSuccess = createAction(
  '[Match] Start Match Success'
);

export const startMatchOnTableError = createAction(
  '[Match] Start Match Error'
);

export const callPlayerForMatch = createAction(
  '[Match] Call Player for Match',
  props<{ playerIds: number[], matchId: number }>()
);

export const callPlayerForMatchSuccess = createAction(
  '[Match] Call Player for Match Success'
);

export const callPlayerForMatchError = createAction(
  '[Match] Call Player for Match Error'
);

export const takeBackMatch = createAction(
  '[Match] Take back',
  props<{ matchId: number }>()
);

export const takeBackMatchSuccess = createAction(
  '[Match] Take back Success'
);

export const takeBackMatchError = createAction(
  '[Match] Take back Error'
);

