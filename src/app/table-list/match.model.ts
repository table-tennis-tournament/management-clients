import {Player} from './player.model';

export interface Match {
    match_id?: number;
    result?: any;
    player_a?: Player;
    player_b?: Player;
    classification?: string;
}
