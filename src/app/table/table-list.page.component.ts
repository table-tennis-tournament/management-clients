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

    onFreeTable(tableNr: number) {
        const item = this.getTableByNr(tableNr);
        if (item[0].matchinfo.length === 1) {
            const freeTableEvent = new TableMatchEvent([item[0].matchinfo[0].match.id], tableNr);
            this.store.dispatch(new FreeTable(freeTableEvent));
        }
    }

    onTakeBackTable(tableNr: number) {
        const item = this.getTableByNr(tableNr);
        if (item[0].matchinfo.length === 1) {
            const takeBackTableEvent = new TableMatchEvent([item[0].matchinfo[0].match.id], tableNr);
            this.store.dispatch(new TakeBackTable(takeBackTableEvent));
        }
    }

    private getTableByNr(tableNr: number) {
        let currentState;
        this.store.subscribe(state => currentState = state);
        const item: TableDto[] = currentState.table.tables.filter(x => x.table.number === tableNr);
        return item;
    }

}
