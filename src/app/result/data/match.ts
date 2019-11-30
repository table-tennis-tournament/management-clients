import {Group} from './group';
import {MatchType} from './matchType';
import {Player} from './player';
import {Type} from './type';

export interface Match {
  id?: number;
  startTime?: Date;
  isPlayed?: boolean;
  result?: any;
  isPlayable?: boolean;
  isInWaitingList?: boolean;
  table?: number[];
  team1?: Player[];
  team2?: Player[];
  matchType?: MatchType;
  type?: Type;
  group?: Group;
}
