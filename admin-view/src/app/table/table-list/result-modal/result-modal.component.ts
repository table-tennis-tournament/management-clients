import {Component, ElementRef, EventEmitter, Inject, ViewChild} from '@angular/core';
import {TTMatchResult} from './ttmatch-result.model';
import {ResultCheckerService} from './result-checker.service';
import {ResultCheckModel} from './result-check.model';
import {Match} from '../../../shared/data/match.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'toma-result-modal',
    templateUrl: './result-modal.component.html',
    styleUrls: ['./result-modal.component.scss']
})
export class ResultModalComponent {

    checkerResult: ResultCheckModel = {
        firstPlayerWinning: false,
        secondPlayerWinning: false,
        currentResult: []
    };

    currentInput: string;

    public OnResultForMatch: EventEmitter<TTMatchResult> = new EventEmitter<TTMatchResult>();

    @ViewChild('answer') private elementRef: ElementRef;

    constructor(private resultCheckerService: ResultCheckerService,
                public dialogRef: MatDialogRef<ResultModalComponent>,
                @Inject(MAT_DIALOG_DATA) public currentMatch: Match) {
        this.setInputIfAvailable();
    }

    focusElement() {
        if (this.elementRef != null) {
            this.elementRef.nativeElement.focus();
        }
    }


    onKeyUp(value) {
        this.checkerResult = this.resultCheckerService.checkResult(value);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    getResult() {
        if (this.checkerResult.firstPlayerWinning || this.checkerResult.secondPlayerWinning) {
            return {
                result: this.checkerResult.currentResult,
                match: this.currentMatch
            };
        }
    }

    resultNotValid() {
        return !this.checkerResult.firstPlayerWinning && !this.checkerResult.secondPlayerWinning;
    }

    private setInputIfAvailable() {
        const matchToSet = this.currentMatch;
        let resultString = '';
        if (matchToSet.result) {
            matchToSet.result.forEach(element => {
                if (element[0] > element[1]) {
                    resultString += element[1] + ' ';
                } else {
                    resultString += '-' + element[0] + ' ';
                }
            });
            resultString = resultString.substr(0, resultString.length - 1);
            this.onKeyUp(resultString);
        }
        this.currentInput = resultString;
    }
}
