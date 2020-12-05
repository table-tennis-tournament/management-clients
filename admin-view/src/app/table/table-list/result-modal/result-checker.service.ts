import {Injectable} from '@angular/core';
import {ResultCheckModel} from './result-check.model';

@Injectable({
    providedIn: 'root'
})
export class ResultCheckerService {

    public checkResult(valueToCheck: string): ResultCheckModel {
        const result: ResultCheckModel = {
            firstPlayerWinning: false,
            secondPlayerWinning: false,
            currentResult: []
        };
        const splitValue = valueToCheck.split(' ');
        if (splitValue.length < 3) {
            return result;
        }
        let player1 = 0;
        let player2 = 0;
        for (let index = 0; index < splitValue.length; index++) {
            const currentValue = splitValue[index];
            if (this.isFirstCharAMinus(currentValue)) {
                const resultWithoutMinus = +currentValue.substring(1);
                const otherResult = this.getOtherResult(resultWithoutMinus);
                result.currentResult[index] = [resultWithoutMinus, otherResult];
                player2++;
                continue;
            }
            if (currentValue !== '') {
                const otherResult = +this.getOtherResult(+currentValue);
                result.currentResult[index] = [otherResult, +currentValue];
                player1++;
                continue;
            }
        }
        if (player1 === 3 && player2 < 3) {
            result.firstPlayerWinning = true;
            return result;
        }
        if (player2 === 3 && player1 < 3) {
            result.secondPlayerWinning = true;
            return result;
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
