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
  /** How many Calls have been announced (0-3): the highest call of the match's players. */
  callNumber?: number;
  /** The call (2 or 3) the table manager requested and the caller has not announced yet. */
  requestedCallNumber?: number | null;
  /** When the first Call was announced. */
  firstCallTime?: string | null;
  /** The calls of each player; `requested` while their next call waits for the caller. */
  playerCalls?: { playerId: number; callNumber: number; requested: boolean }[];
  tableId?: number;
  /** The number of the table the match is at, as players see it; not the same as [tableId]. */
  tableNumber?: number;
  /** The other table a group match waits at, if it has two; it is started at one and leaves the other. */
  secondTableId?: number;
  /** The number of [secondTableId], as players see it. */
  secondTableNumber?: number;
  team1?: Player[];
  team2?: Player[];
  matchType?: StageType;
  type?: Discipline;
  playGroup?: Group;
  isPlayable?: boolean;
  isPlayed?: boolean;
  isPlaying?: boolean;
  isKampflos?: boolean;
}
