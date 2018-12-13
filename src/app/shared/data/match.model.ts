import {Group} from './group.model';
import {Player} from './player.model';
import {Discipline} from '../../discipline/discipline.model';
import {StageType} from './stagetype.model';

export interface Match {
    id?: number;
    startTime?: number;
    isPlayed?: boolean;
    result?: any;
    isPlayable?: boolean;
    isInWaitingList?: boolean;
    table?: number[];
    team1?: Player[];
    team2?: Player[];
    matchType?: StageType;
    type?: Discipline;
    group?: Group;
}
