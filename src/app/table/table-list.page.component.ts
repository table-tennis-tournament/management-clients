import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getTablesLoading, getTableState} from '../app-state.reducer';
import {FreeTable, LoadTables, LockTable, TakeBackTable, UnLockTable} from './redux/table.actions';
import {TableDto} from './tabledto.model';
import {TableMatchEvent} from './redux/table.match.event';

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
        this.store.dispatch(new LoadTables(null));
        this.tables = this.store.select(getTableState);
        this.tablesLoading = this.store.select(getTablesLoading);

    }

    onLockTable(tableNr: number) {
        this.store.dispatch(new LockTable(tableNr));
    }

    onUnLockTable(tableNr: number) {
        this.store.dispatch(new UnLockTable(tableNr));
    }

    onFreeTable(table: TableDto) {
        if (table.matchinfo.length === 1) {
            const freeTableEvent = new TableMatchEvent([table.matchinfo[0].match.id], table.table.number);
            this.store.dispatch(new FreeTable(freeTableEvent));
        }
    }

    onTakeBackTable(table: TableDto) {
        if (table.matchinfo.length === 1) {
            const takeBackTableEvent = new TableMatchEvent([table.matchinfo[0].match.id], table.table.number);
            this.store.dispatch(new TakeBackTable(takeBackTableEvent));
        }
    }


}
