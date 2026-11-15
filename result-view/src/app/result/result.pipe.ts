import { Pipe, PipeTransform } from '@angular/core';
import { SetScore, setsWon } from '../shared/result-entry/result-entry';

/** `match.sets | resultPipe: true` gives the Sets won by Side 1, `: false` by Side 2; empty without Sets. */
@Pipe({
  name: 'resultPipe',
  standalone: false,
})
export class ResultPipe implements PipeTransform {
  transform(sets: SetScore[] | null | undefined, firstPlayer: boolean): number | string {
    if (!Array.isArray(sets) || sets.length < 1) {
      return '';
    }
    const won = setsWon(sets);
    return firstPlayer ? won.player1 : won.player2;
  }
}
