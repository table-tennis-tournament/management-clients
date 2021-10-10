import { Player } from '../../../shared/data/player.model';
import { Match } from '../../../shared/data/match.model';

export interface DisciplineGroup {
  name?: string;
  players?: Player[];
  matches?: Match[];
  tableNumbers?: number[];
  isPlayerActive?: boolean;
  isMatchActive?: boolean;
  isComplete?: boolean;
}
