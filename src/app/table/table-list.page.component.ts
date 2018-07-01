import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getTablesLoading, getTableState} from '../app-state.reducer';
import {LoadTables, LockTable} from './redux/table.actions';
import {TableDto} from './tabledto.model';

@Component({
    selector: 'toma-table-list.page',
    templateUrl: './table-list.page.component.html'
})
export class TableListPageComponent implements OnInit {

    tables: Observable<TableDto[]>;
    tablesLoading: Observable<boolean>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadTables());
        this.tables = this.store.select(getTableState);
        this.tablesLoading = this.store.select(getTablesLoading);
    }

    onLockTable(tableNr: number) {
        this.store.dispatch(new LockTable(tableNr));
    }

}
