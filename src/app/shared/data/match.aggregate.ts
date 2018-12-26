import {Discipline} from '../../discipline/discipline.model';
import {Match} from './match.model';
import {Player} from './player.model';

export interface MatchAggregate {
    name?: string;
    discipline?: Discipline;
    matches?: Match[];
    players?: Player[];
    tableNumbers?: number[];
}
