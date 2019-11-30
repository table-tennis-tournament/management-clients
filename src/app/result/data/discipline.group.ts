import {Match} from './match';
import {Player} from './player';

export class DisciplineGroup {
  name: string;
  players: Player[] = [];
  matches: Match[] = [];
  bgColor: string;
  textColor: string;
  tableNumbers: number[] = [];
  isPlayerActive = true;
  isMatchActive = true;
  isComplete = false;
}
