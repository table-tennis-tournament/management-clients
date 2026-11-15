import { Group } from './group.model';
import { Player } from './player.model';
import { Discipline } from '../../discipline/discipline.model';
import { StageType } from './stagetype.model';
import { SetResult } from './set-result.model';

export interface Match {
  id?: number;
  startTime?: string;
  /** The set summary, e.g. `3 : 1`; also bound to the quick-entry input of the result list. */
  result?: any;
  /** The per-set points of the match. */
  sets?: SetResult[];
  waitingList?: boolean;
  state?: string;
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
