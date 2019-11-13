import {Player} from '../../match/player.model';

export interface GameData {
  player: Player;
  gameNr: number;
  isPlayerA: boolean;
}
