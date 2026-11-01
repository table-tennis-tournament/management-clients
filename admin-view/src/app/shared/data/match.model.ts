import { Group } from './group.model';
import { Player } from './player.model';
import { Discipline } from '../../discipline/discipline.model';
import { StageType } from './stagetype.model';

export interface Match {
  id?: number;
  startTime?: string;
  result?: any;
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
