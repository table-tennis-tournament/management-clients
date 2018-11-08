import {Component, ComponentRef, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getTablesLoading, getTableState} from '../app-state.reducer';
import {AssignToSecondTable, FreeTable, LoadTables, LockTable, PrintTable, TakeBackTable, UnLockTable} from './redux/table.actions';
import {TableDto} from './tabledto.model';
import {TableMatchEvent} from './redux/table.match.event';
import {ResultModalComponent} from './table-list/result-modal/result-modal.component';
import {MzModalService} from 'ngx-materialize';

@Component({
    selector: 'toma-table-list.page',
    templateUrl: './table-list.page.component.html'
})
export class TableListPageComponent implements OnInit {

    tables: Observable<TableDto[]>;
    tablesLoading: Observable<boolean>;

    constructor(private store: Store<any>, private modalService: MzModalService) {
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
        if (table.matches.length === 1) {
            const freeTableEvent = new TableMatchEvent([table.matches[0].match.id], table.number);
            this.store.dispatch(new FreeTable(freeTableEvent));
            return;
        }

    }

    onTableRefresh() {
        this.store.dispatch(new LoadTables(null));
    }

    onTakeBackTable(table: TableDto) {
        if (table.matches.length === 1) {
            const takeBackTableEvent = new TableMatchEvent([table.matches[0].match.id], table.number);
            this.store.dispatch(new TakeBackTable(takeBackTableEvent));
        }
    }

    onPrintTable(table: TableDto) {
        if (table.matches.length === 1) {
            this.store.dispatch(new PrintTable({matchId: table.matches[0].match.id}));
        }
    }

    onAssignSecondTable(table: TableDto) {
        if (table.matches.length < 2) {
            return;
        }
        const selectedMatchIds = table.matches.map(match => match.match.id);
        this.store.dispatch(new AssignToSecondTable({tableNr: 4, matchIds: selectedMatchIds}));
    }

    onResultForTable(table: TableDto) {
        if (table.matches.length !== 1) {
            return;
        }
        const dialog: ComponentRef<ResultModalComponent> =
            <ComponentRef<ResultModalComponent>> this.modalService.open(ResultModalComponent);
        dialog.instance.setMatch(table.matches[0]);
    }


}
