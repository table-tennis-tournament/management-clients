import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableDto} from '../tabledto.model';
import {MatchToTable} from './tt-table/tt-table-content/matchtotable.model';

@Component({
    selector: 'toma-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.scss']
})
export class TableListComponent {

    @Input()
    tables: TableDto[];

    @Input()
    tablesLoading: boolean;

    @Input()
    typeColor: string[];

    @Output()
    lockTable = new EventEmitter<number>();

    @Output()
    unLockTable = new EventEmitter<number>();

    @Output()
    freeTable = new EventEmitter<TableDto>();

    @Output()
    takeBackTable = new EventEmitter<TableDto>();

    @Output()
    printTable = new EventEmitter<TableDto>();

    @Output()
    assignSecondTable = new EventEmitter<TableDto>();

    @Output()
    resultForTable = new EventEmitter<TableDto>();

    @Output()
    assignMatchToTable = new EventEmitter<MatchToTable>();

}
