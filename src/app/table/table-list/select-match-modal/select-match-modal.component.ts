import {Component, EventEmitter, ViewChild} from '@angular/core';
import {Match} from '../../../matchview/match.model';
import {MzBaseModal, MzModalComponent} from 'ngx-materialize';
import {customModalOptions} from '../../../shared/modal.options';

@Component({
    selector: 'toma-select-match-modal',
    templateUrl: './select-match-modal.component.html',
    styleUrls: ['./select-match-modal.component.scss']
})
export class SelectMatchModalComponent extends MzBaseModal {

    _matches: Match[];
    modalOptions: Materialize.ModalOptions = customModalOptions;

    currentValues: boolean[] = [];

    @ViewChild('selectMatchModal') modal: MzModalComponent;

    public OnMatchesSelected: EventEmitter<Match[]> = new EventEmitter<Match[]>();

    set matches(matches: Match[]) {
        this._matches = matches;
    }

    get matches(): Match[] {
        return this._matches;
    }

    onOk() {
        // ugly solution because of [(ngModel)]=match.match.isPlayable ist not working
        const result = [];
        this.currentValues.forEach((x, index) => {
            if (x) {
                result.push(this.matches[index]);
            }
        });
        this.fireEventAndClose(result);
    }

    private fireEventAndClose(result) {
        this.OnMatchesSelected.emit(result);
        this.modal.closeModal();
    }

}
