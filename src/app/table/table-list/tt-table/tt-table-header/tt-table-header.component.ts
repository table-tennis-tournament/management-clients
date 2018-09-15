import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableDto} from '../../../tabledto.model';

@Component({
    selector: 'toma-tt-table-header',
    templateUrl: './tt-table-header.component.html',
    styleUrls: ['./tt-table-header.component.scss']
})
export class TtTableHeaderComponent implements OnInit {

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
