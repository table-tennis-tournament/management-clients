import {Discipline} from '../../discipline/discipline.model';
import {Match} from './match.model';
import {Player} from './player.model';

export interface MatchAggregate {
    name?: string;
    startTime?: string;
    discipline?: Discipline;
    players?: Player[];
    matches?: Match[];
    tableNumbers?: number[];
}
