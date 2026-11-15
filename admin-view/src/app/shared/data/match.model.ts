import { MatchStateName } from '../match-state/match-state';
import { Group } from './group.model';
import { Player } from './player.model';
import { Discipline } from '../../discipline/discipline.model';
import { StageType } from './stagetype.model';
import { SetScore } from '../result-entry/result-entry';

export interface Match {
  id?: number;
  startTime?: string;
  /** The set summary, e.g. `3 : 1`; also bound to the quick-entry input of the result list. */
  result?: any;
  /** The per-set points of the match. Read them through `shared/result-entry`. */
  sets?: SetScore[];
  waitingList?: boolean;
  /** The lifecycle state; ask `shared/match-state` instead of comparing it. */
  state?: MatchStateName;
  /** How many Calls have been announced (0-3). */
  callNumber?: number;
  tableId?: number;
  team1?: Player[];
  team2?: Player[];
  matchType?: StageType;
  type?: Discipline;
  playGroup?: Group;
  isPlayable?: boolean;
  isPlayed?: boolean;
  isPlaying?: boolean;
  isKampflos?: boolean;
  callState?: string;
}
