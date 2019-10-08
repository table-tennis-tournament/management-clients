import {Player} from './player.model';
import {Classification} from './classification.model';

export interface Match {
    match_id?: number;
    result?: any;
    player_a?: Player;
    player_b?: Player;
    classification?: string;
}
