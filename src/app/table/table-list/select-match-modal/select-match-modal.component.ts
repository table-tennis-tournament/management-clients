import {Component, EventEmitter, ViewChild} from '@angular/core';
import {Match} from '../../../matchview/match.model';
import {MzBaseModal, MzModalComponent} from 'ngx-materialize';

@Component({
    selector: 'toma-select-match-modal',
    templateUrl: './select-match-modal.component.html',
    styleUrls: ['./select-match-modal.component.scss']
})
export class SelectMatchModalComponent extends MzBaseModal {

    private matches: Match[];
    private modalOptions: Materialize.ModalOptions = customModalOptions;

    @ViewChild('selectMatchModal') modal: MzModalComponent;

    public OnMatchesSelected: EventEmitter<Match[]> = new EventEmitter<Match[]>();

    setMatches(matches: Match[]) {
        this.matches = matches;
    }

    onOk() {
        const result = this.matches.filter(x => x.match.isPlayed);
        this.fireEventAndClose(result);
    }

    private fireEventAndClose(result) {
        this.OnMatchesSelected.emit(result);
        this.modal.closeModal();
    }

}
