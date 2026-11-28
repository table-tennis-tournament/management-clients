import { Pipe, PipeTransform } from '@angular/core';
import { isWalkover } from '../shared/match-state/match-state';
import { matchWinner, setsWon } from '../shared/result-entry/result-entry';
import { Match } from './data/match';

/**
 * `match | resultPipe: true` gives the Sets won by Side 1, `: false` by Side 2; empty without Sets. A Walkover
 * shows "kampflos" for the Side that won it and nothing for the other, not its 3:0.
 */
@Pipe({
  name: 'resultPipe',
  standalone: false,
})
export class ResultPipe implements PipeTransform {
  transform(match: Pick<Match, 'state' | 'sets'> | null | undefined, firstPlayer: boolean): number | string {
    const sets = match?.sets;
    if (!match || !Array.isArray(sets) || sets.length < 1) {
      return '';
    }
    if (isWalkover(match)) {
      return matchWinner(sets) === (firstPlayer ? 1 : 2) ? 'kampflos' : '';
    }
    const won = setsWon(sets);
    return firstPlayer ? won.player1 : won.player2;
  }
}
