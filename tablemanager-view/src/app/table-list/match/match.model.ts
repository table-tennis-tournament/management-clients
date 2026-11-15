import { MatchStateName } from '../../shared/match-state/match-state';
import { Player } from './player.model';
import { Result } from './result.model';

export interface Match {
  match_id?: number;
  result?: Result;
  players_a?: Player[];
  players_b?: Player[];
  stage?: string;
  classification?: string;
  /** The lifecycle state; ask `shared/match-state` instead of comparing it. */
  state?: MatchStateName;
  /** How many Calls have been announced (0-3). */
  callNumber?: number;
}
