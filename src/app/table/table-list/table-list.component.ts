import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableDto} from '../tabledto.model';

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

    @Output()
    lockTable = new EventEmitter<number>();

    @Output()
    unLockTable = new EventEmitter<number>();

    @Output()
    freeTable = new EventEmitter<number>();

    @Output()
    takeBackTable = new EventEmitter<number>();

}
