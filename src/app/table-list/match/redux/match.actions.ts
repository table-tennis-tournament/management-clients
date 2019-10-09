import {createAction, props} from '@ngrx/store';
import {Game} from '../game.model';

export const updateMatchResult = createAction(
    '[Match] Update Match Result',
    props<{ matchId: number, game: Game }>()
);

export const updateMatchResultSuccess = createAction(
    '[Match] Update Match Result Success',
    props<{}>()
);

export const updateMatchResultError = createAction(
    '[Match] Update Match Result Error',
    props<{}>()
);

