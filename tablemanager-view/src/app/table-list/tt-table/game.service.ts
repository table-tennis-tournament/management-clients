import {Injectable} from '@angular/core';
import {Game} from '../match/game.model';
import {Result} from '../match/result.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public getGames(valueToCheck: string): Game[] {
    const result: Game[] = [];
    const splitValue = valueToCheck.split(' ');
    for (const currentValue of splitValue) {
      if (this.isFirstCharAMinus(currentValue)) {
        const resultWithoutMinus = Math.abs(Number(currentValue));
        const otherValue = this.getOtherResult(resultWithoutMinus);
        result.push({
          score_player_a: resultWithoutMinus,
          score_player_b: otherValue
        });
        continue;
      }
      if (currentValue !== '') {
        const gameResult = Number(currentValue);
        const otherResult = this.getOtherResult(gameResult);
        result.push({
          score_player_a: otherResult,
          score_player_b: gameResult
        });
      }
    }
    return result;

  }

  isFirstCharAMinus(resultToCheck) {
    return resultToCheck.charAt(0) === '-';
  }

  getOtherResult(opponentsResult: number): number {
    if (opponentsResult < 10) {
      return 11;
    }
    return opponentsResult + 2;
  }

  playerAWon(game: Game) {
    return game.score_player_a > game.score_player_b;
  }

  playerBWon(game: Game) {
    return game.score_player_b > game.score_player_a;
  }

  playerWonMatch(gamesWonPlayer: number) {
    return gamesWonPlayer === 3;
  }

  playerHasWon(result: Result) {
    return this.playerWonMatch(result.games_won_player_a) || this.playerWonMatch(result.games_won_player_b);
  }

  gameHasNoResult(game: Game) {
    return game.score_player_a === 0 && game.score_player_b === 0;
  }

  createResult(result: number, isPlayerA: boolean) {
    const otherResult = this.getOtherResult(result);
    if (isPlayerA) {
      return {
        score_player_a: otherResult,
        score_player_b: result
      };
    }
    return {
      score_player_a: result,
      score_player_b: otherResult
    };
  }
}
