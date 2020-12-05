import {Game} from './game.model';

export interface Result {
    games?: Game[];
    games_won_player_a?: number;
    games_won_player_b?: number;
}
