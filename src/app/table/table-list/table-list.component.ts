import {Component, Input} from '@angular/core';
import {TableDto} from '../tabledto.model';

@Component({
    selector: 'toma-table-list',
    templateUrl: './table-list.component.html'
})
export class TableListComponent {

    @Input()
    tables: TableDto[];
    public rowCount: number[];

}
