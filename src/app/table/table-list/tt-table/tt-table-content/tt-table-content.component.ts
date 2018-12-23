import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableDto} from '../../../tabledto.model';
import {MatchToTable} from './matchtotable.model';

@Component({
    selector: 'toma-tt-table-content',
    templateUrl: './tt-table-content.component.html',
    styleUrls: ['./tt-table-content.component.scss']
})
export class TtTableContentComponent {

    @Input('table')
    table: TableDto;

    @Output()
    freeTable = new EventEmitter<number>();

    @Output()
    assignMatchToTable = new EventEmitter<MatchToTable>();


    onMatchDrop(event) {
        if (this.isDropDataValid(event)) {
            this.assignMatchToTable.emit({
                matchIds: event.dragData.matches.map(match => match.id),
                tableId: this.table.id,
                tableNr: this.table.number
            });
        }
    }

    private isDropDataValid(event) {
        return (!this.table.matches || !this.table.matches[0]) && event.dragData
            && event.dragData.matches;
    }
}
