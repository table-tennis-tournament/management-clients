import {Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {MzBaseModal, MzModalComponent} from 'ngx-materialize';
import {TTMatchResult} from './ttmatch-result.model';
import {customModalOptions} from '../../../shared/modal.options';
import {ResultCheckerService} from './result-checker.service';
import {ResultCheckModel} from './result-check.model';
import {Match} from '../../../shared/data/match.model';

@Component({
    selector: 'toma-result-modal',
    templateUrl: './result-modal.component.html',
    styleUrls: ['./result-modal.component.scss']
})
export class ResultModalComponent extends MzBaseModal {

    checkerResult: ResultCheckModel = {
        firstPlayerWinning: false,
        secondPlayerWinning: false,
        currentResult: []
    };

    currentInput: string;

    private _currentMatch: Match;
    public OnResultForMatch: EventEmitter<TTMatchResult> = new EventEmitter<TTMatchResult>();

    public modalOptions: Materialize.ModalOptions = customModalOptions;

    @ViewChild('resultModal') modal: MzModalComponent;

    @ViewChild('answer') private elementRef: ElementRef;

    constructor(private resultCheckerService: ResultCheckerService) {
        super();
    }

    focusElement() {
        if (this.elementRef != null) {
            this.elementRef.nativeElement.focus();
        }
    }

    get currentMatch(): Match {
        return this._currentMatch;
    }

    set currentMatch(value: Match) {
        this._currentMatch = value;
        this.setInputIfAvailable();
        setTimeout(this.focusElement.bind(this), 200);
    }

    onKeyUp(value) {
        this.checkerResult = this.resultCheckerService.checkResult(value);
    }

    checkResultAndClose() {
        if (this.checkerResult.firstPlayerWinning || this.checkerResult.secondPlayerWinning) {
            this.OnResultForMatch.emit({
                result: this.checkerResult.currentResult,
                match: this._currentMatch
            });
            this.modal.closeModal();
        }
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
