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

