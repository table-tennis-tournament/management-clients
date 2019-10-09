import {Player} from './player.model';
import {Result} from './result.model';

export interface Match {
    match_id?: number;
    result?: Result;
    player_a?: Player;
    player_b?: Player;
    classification?: string;
}
