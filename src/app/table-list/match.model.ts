import {Player} from './player.model';
import {Classification} from './classification.model';

export interface Match {
    matchId?: number;
    result?: any;
    playerA?: Player;
    playerB?: Player;
    classification?: Classification;
}
