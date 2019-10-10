import {Injectable} from '@angular/core';
import {Game} from '../../match/game.model';

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
}
