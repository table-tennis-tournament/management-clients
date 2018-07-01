import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getTableState} from '../app-state.reducer';
import {LoadTables} from './redux/table.actions';
import {TableDto} from './tabledto.model';

@Component({
    selector: 'toma-table-list.page',
    templateUrl: './table-list.page.component.html'
})
export class TableListPageComponent implements OnInit {

    tables: Observable<TableDto[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadTables());
        this.tables = this.store.select(getTableState);
    }

    onLockTable(tableNr: number) {
        console.log(tableNr);
    }

}
