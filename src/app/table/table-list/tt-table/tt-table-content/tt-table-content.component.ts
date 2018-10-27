import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableDto} from '../../../tabledto.model';

@Component({
    selector: 'toma-tt-table-content',
    templateUrl: './tt-table-content.component.html',
    styleUrls: ['./tt-table-content.component.scss']
})
export class TtTableContentComponent {

    @Input('table')
    table: TableDto

    @Output()
    freeTable = new EventEmitter<number>();

}
