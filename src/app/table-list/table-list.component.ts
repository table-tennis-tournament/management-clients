import {Component, OnInit} from '@angular/core';
import {Table} from './table.model';

@Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.sass']
})
export class TableListComponent implements OnInit {

    tables: Table[];

    constructor() {
    }

    ngOnInit() {
    }

}
