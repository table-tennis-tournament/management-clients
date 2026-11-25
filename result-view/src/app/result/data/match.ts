import { MatchStateName } from '../../shared/match-state/match-state';
import { SetScore } from '../../shared/result-entry/result-entry';
import { Group } from './group';
import { MatchType } from './matchType';
import { Player } from './player';
import { Type } from './type';

export interface Match {
  id?: number;
  startTime?: Date;
  isPlayed?: boolean;
  /** The set summary, e.g. `3 : 1`. */
  result?: string;
  /** The per-set points of the match. Read them through `shared/result-entry`. */
  sets?: SetScore[];
  isPlayable?: boolean;
  waitingList?: boolean;
  tableId?: number;
  team1?: Player[];
  team2?: Player[];
  /** The side ids of [team1] and [team2]: a player id, or `100000 + doubles id`. */
  side1Id?: number;
  side2Id?: number;
  matchType?: MatchType;
  type?: Type;
  playGroup?: Group;
  /** The lifecycle state; ask `shared/match-state` instead of comparing it. */
  state?: MatchStateName;
  /** How many Calls have been announced (0-3). */
  callNumber?: number;
}
