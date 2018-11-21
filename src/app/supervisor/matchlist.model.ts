import {MatchListItem} from './matchlistitem.model';
import {Match} from '../shared/data/match.model';

export interface MatchList {
    matchListItem?: MatchListItem;
    matchinfo: Match[];
}