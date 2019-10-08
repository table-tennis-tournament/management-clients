import {Component, OnInit} from '@angular/core';
import {Table} from './table.model';
import { TableService } from './table.service';

@Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.sass']
})
export class TableListComponent implements OnInit {

    tables: Table[];

    constructor(public service: TableService) {
    }

    ngOnInit() {
        this.service.getTables(22).subscribe(tables => {
            this.tables = tables;
        });
    }

}
