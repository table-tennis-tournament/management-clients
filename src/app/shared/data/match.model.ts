import {Group} from './group.model';
import {Player} from './player.model';
import {Type} from '../../typeview/type.model';
import {MatchState} from './matchstate.model';
import {MatchType} from '../../matchview/matchtype.model';

export interface Match {
    team1?: Player[];
    team2?: Player[];
    type?: Type;
    stage?: string;
    matchType?: MatchType;
    group?: Group;
    tableNumber?: number;
    match?: MatchState;
    table?: number[];
    isPlayable?: boolean;
    isInWaitingList?: boolean;
}
