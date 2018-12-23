import {Group} from './group.model';
import {Player} from './player.model';
import {Discipline} from '../../discipline/discipline.model';
import {MatchState} from './matchstate.model';
import {StageType} from './stagetype.model';

export interface Match {
    team1?: Player[];
    team2?: Player[];
    type?: Discipline;
    stage?: string;
    matchType?: StageType;
    group?: Group;
    tableNumber?: number;
    match?: MatchState;
    table?: number[];
    isPlayable?: boolean;
    isInWaitingList?: boolean;
}
