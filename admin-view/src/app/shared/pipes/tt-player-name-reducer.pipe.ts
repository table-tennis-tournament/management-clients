import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '../data/player.model';

@Pipe({
  name: 'ttPlayerNameReducer',
  standalone: false,
})
export class TtPlayerNameReducerPipe implements PipeTransform {
  transform(players: Player[], args?: any): any {
    if (!players || players.length === 0) {
      return '';
    }
    if (players.length === 1) {
      return this.getSinglePlayerString(players[0]);
    }
    if (players.length === 2) {
      return this.getSinglePlayerStringShort(players[0]) + '/' + this.getSinglePlayerStringShort(players[1]);
    }
    return '';
  }

  getSinglePlayerString(player: Player) {
    const name = `${player?.firstName ?? ''} ${player?.lastName ?? ''}`.trim();
    const club = player?.club?.name;
    return club ? `${name} (${club})` : name;
  }

  getSinglePlayerStringShort(player: Player) {
    const firstName = player?.firstName ?? '';
    return `${firstName.substring(0, 2)}. ${player?.lastName ?? ''}`;
  }
}
