import {Group} from './group.model';
import {Player} from './player.model';
import {Discipline} from '../../discipline/discipline.model';
import {StageType} from './stagetype.model';

export interface Match {
    id?: number;
    startTime?: string;
    result?: any;
    isInWaitingList?: boolean;
    state?: string;
    table?: number[];
    team1?: Player[];
    team2?: Player[];
    matchType?: StageType;
    type?: Discipline;
    group?: Group;
    isPlayable?: boolean;
    isPlayed?: boolean;
}
