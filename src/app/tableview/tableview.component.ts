import {Component, OnInit} from '@angular/core';
import {TableService} from './table.service';
import {TableDto} from './tabledto.model';

@Component({
    selector: 'toma-tableview',
    templateUrl: './tableview.component.html',
    styleUrls: ['./tableview.component.scss']
})
export class TableviewComponent implements OnInit {

    public tables: TableDto[] = [];
    public rowCount: number[];

    constructor(private tableService: TableService) {
    }

    ngOnInit() {
        this.tableService.getAllTables().subscribe(tables => this.tables = tables);
    }

}
