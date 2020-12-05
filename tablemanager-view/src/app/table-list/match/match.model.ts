import {Player} from './player.model';
import {Result} from './result.model';

export interface Match {
    match_id?: number;
    result?: Result;
    players_a?: Player[];
    players_b?: Player[];
    stage?: string;
    classification?: string;
    state?: string;
}
