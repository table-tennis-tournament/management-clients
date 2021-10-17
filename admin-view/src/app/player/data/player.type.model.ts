import { Player } from './player.model';
import { Discipline } from '../../discipline/discipline.model';

export interface PlayerType {
  id: number;
  player?: Player;
  type: Discipline;
  paid: boolean;
}
