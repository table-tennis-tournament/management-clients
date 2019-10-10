import {createAction, props} from '@ngrx/store';
import {Result} from '../result.model';

export const updateMatchResult = createAction(
    '[Match] Update Match Result',
    props<{ matchId: number, result: Result }>()
);

export const updateMatchResultSuccess = createAction(
    '[Match] Update Match Result Success',
    props<{}>()
);

export const updateMatchResultError = createAction(
    '[Match] Update Match Result Error',
    props<{}>()
);

export const finishMatch = createAction(
    '[Match] Finish Match',
    props<{ matchId: number }>()
);

export const finishMatchSuccess = createAction(
    '[Match] Finish Match Success',
    props<{}>()
);

export const finishMatchError = createAction(
    '[Match] Finish Match Error',
    props<{}>()
);

export const startMatchOnTable = createAction(
    '[Match] Start Match',
    props<{ tableId: number, matchId: number }>()
);

export const startMatchOnTableSuccess = createAction(
    '[Match] Start Match Success',
    props<{}>()
);

export const startMatchOnTableError = createAction(
    '[Match] Start Match Error',
    props<{}>()
);

