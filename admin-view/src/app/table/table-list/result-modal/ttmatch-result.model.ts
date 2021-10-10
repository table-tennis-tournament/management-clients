import { Match } from '../../../shared/data/match.model';
import { TTResult } from './ttresult.model';

export interface TTMatchResult {
  match: Match;
  result: TTResult[];
}
