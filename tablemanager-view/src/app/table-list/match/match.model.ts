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
  /** How many Calls have been announced (0-3): the highest call of the match's players. */
  callNumber?: number;
  /** The call (2 or 3) requested from the caller and not announced yet. */
  requestedCallNumber?: number | null;
  /** When the first Call was announced. */
  firstCallTime?: string | null;
}
