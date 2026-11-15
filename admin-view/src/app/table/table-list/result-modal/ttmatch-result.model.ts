import { Match } from '../../../shared/data/match.model';
import { SetScore } from '../../../shared/result-entry/result-entry';

export interface TTMatchResult {
  match: Match;
  result: SetScore[];
}
