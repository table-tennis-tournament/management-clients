import { Pipe, PipeTransform } from '@angular/core';
import { SetResult } from '../data/set-result.model';

@Pipe({
  name: 'resultPipe',
  standalone: false,
})
export class ResultPipe implements PipeTransform {
  FIRST_PLAYER_SETS = 1;
  SECOND_PLAYER_SETS = 2;

  transform(value: SetResult[], setsForPlayer?: number): any {
    if (!Array.isArray(value) || value.length < 1) {
      return '';
    }
    let firstPlayerSets = 0;
    let secondPlayerSets = 0;
    value.forEach((set) => {
      if (set.pointsPlayer1 > set.pointsPlayer2) {
        firstPlayerSets++;
        return;
      }
      secondPlayerSets++;
    });
    if (setsForPlayer === this.FIRST_PLAYER_SETS) {
      return firstPlayerSets;
    }
    if (setsForPlayer === this.SECOND_PLAYER_SETS) {
      return secondPlayerSets;
    }
    return firstPlayerSets + ' : ' + secondPlayerSets;
  }
}
