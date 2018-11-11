import {Match} from '../../../matchview/match.model';
import {TTResult} from './ttresult.model';

export interface TTMatchResult {
    match: Match;
    result: TTResult[];
}
