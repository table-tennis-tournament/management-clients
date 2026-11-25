import { Pipe, PipeTransform } from '@angular/core';
import { SetScore, setsWon } from '../result-entry/result-entry';

/**
 * Shows the Sets won: `sets | resultPipe` gives `3 : 1`, `sets | resultPipe: 1` (or `: 2`) the
 * Sets won by that Side. No Sets give an empty string.
 */
@Pipe({ name: 'resultPipe' })
export class ResultPipe implements PipeTransform {
  transform(sets: SetScore[] | null | undefined, side?: 1 | 2): string | number {
    if (!Array.isArray(sets) || sets.length < 1) {
      return '';
    }
    const won = setsWon(sets);
    if (side === 1) {
      return won.player1;
    }
    if (side === 2) {
      return won.player2;
    }
    return `${won.player1} : ${won.player2}`;
  }
}
