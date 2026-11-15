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
  matchType?: MatchType;
  type?: Type;
  playGroup?: Group;
  state?: string;
}
