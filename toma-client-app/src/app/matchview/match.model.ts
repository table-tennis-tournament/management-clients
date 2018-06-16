import {Player} from '../playerview/player.model';
import {Type} from '../typeview/type.model';
import {MatchType} from './matchtype.model';
import {Group} from '../groupview/group.model';
import {MatchState} from './matchstate.model';

export interface Match {
  id?: number;
  team1?: Player[];
  team2?: Player[];
  type?: Type;
  stage?: string;
  matchType?: MatchType;
  group?: Group;
  tableNumber?: number;
  match?: MatchState;
  table?: number[];
  isPlayable?: boolean;
  isInWaitingList?: boolean;
}
