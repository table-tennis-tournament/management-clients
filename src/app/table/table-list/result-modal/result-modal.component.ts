import {Component} from '@angular/core';
import {MzBaseModal} from 'ngx-materialize';
import {TTResult} from './ttresult.model';
import {Match} from '../../../matchview/match.model';

@Component({
    selector: 'toma-result-modal',
    templateUrl: './result-modal.component.html',
    styleUrls: ['./result-modal.component.scss']
})
export class ResultModalComponent extends MzBaseModal {

    public resultIsValid: boolean;
    public firstPlayerString: string;
    public secondPlayerString: string;
    public headerString: string;
    public isFirstPlayerWinning: boolean;
    public isSecondPlayerWinning: boolean;
    // public OnResultGotObserver: Observable<IResult[]>
    // private currentResultHandler: IResultHandler;
    public currentResult: TTResult[];
    public currentInput: string;

    private currentMatch: Match;

    public modalOptions: Materialize.ModalOptions = {
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 30, // Transition in duration
        outDuration: 20, // Transition out duration
        startingTop: '5%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
    };

    onKeyUp(value) {
        this.resultIsValid = this.checkValidResult(value);
    }

    checkValidResult(valueToCheck): boolean {
        this.isFirstPlayerWinning = false;
        this.isSecondPlayerWinning = false;
        this.currentResult = [];
        const splitValue = valueToCheck.split(' ');
        if (splitValue.length < 3) {
            return false;
        }
        let player1 = 0;
        let player2 = 0;
        for (let index = 0; index < splitValue.length; index++) {
            const currentValue = splitValue[index];
            if (this.isFirstCharAMinus(currentValue)) {
                const resultWithoutMinus = +currentValue.substring(1);
                const otherResult = this.getOtherResult(resultWithoutMinus);
                this.currentResult[index] =  [resultWithoutMinus, otherResult];
                player2++;
                continue;
            }
            if (currentValue !== '' && !isNaN(currentValue)) {
                const otherResult = +this.getOtherResult(+currentValue);
                this.currentResult[index] = [otherResult, +currentValue];
                player1 ++;
                continue;
            }
        }
        if (player1 === 3 && player2 < 3) {
            this.isFirstPlayerWinning = true;
            return true;
        }
        if (player2 === 3 && player1 < 3) {
            this.isSecondPlayerWinning = true;
            return true;
        }
        return false;
    }

    isFirstCharAMinus(resultToCheck){
        return resultToCheck.charAt(0) === "-";
    }

    getOtherResult(opponentsResult: number): number{
        if(opponentsResult < 10){
            return 11;
        }
        return opponentsResult + 2;
    }

}
