import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getTablesLoading, getTableState} from '../app-state.reducer';
import {FreeTable, LoadTables, LockTable, UnLockTable} from './redux/table.actions';
import {TableDto} from './tabledto.model';
import {FreeTableEvent} from './redux/free.table.event';

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

    onFreeTable(tableNr: number) {
        let currentState;
        this.store.subscribe(state => currentState = state);
        const item: TableDto[] = currentState.table.tables.filter(x => x.table.number === tableNr);
        if (item[0].matchinfo.length === 1) {
            const freeTableEvent = new FreeTableEvent([item[0].matchinfo[0].match.id], tableNr);
            this.store.dispatch(new FreeTable(freeTableEvent));
        }
    }

}
