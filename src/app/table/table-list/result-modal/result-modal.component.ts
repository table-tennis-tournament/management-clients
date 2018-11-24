import {Component, EventEmitter, ViewChild} from '@angular/core';
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

    private _currentMatch: Match;
    public OnResultForMatch: EventEmitter<TTMatchResult> = new EventEmitter<TTMatchResult>();

    public modalOptions: Materialize.ModalOptions = customModalOptions;

    @ViewChild('resultModal') modal: MzModalComponent;

    constructor(private resultCheckerService: ResultCheckerService) {
        super();
    }

    get currentMatch(): Match {
        return this._currentMatch;
    }

    set currentMatch(value: Match) {
        this._currentMatch = value;
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

}
