import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableDto} from '../../../tabledto.model';

@Component({
    selector: 'toma-tt-table-content',
    templateUrl: './tt-table-content.component.html',
    styleUrls: ['./tt-table-content.component.scss']
})
export class TtTableContentComponent implements OnInit {

    _table: TableDto;

    get table(): TableDto {
        return this._table;
    }

    @Input('table')
    set table(value: TableDto) {
        this._table = value;
    }

    @Output()
    freeTable = new EventEmitter<number>();

    constructor() {
    }

    ngOnInit() {
    }

}
