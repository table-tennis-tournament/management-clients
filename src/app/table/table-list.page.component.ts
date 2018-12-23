import {Component, ComponentRef, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {getTablesLoading, getTableState, getTypeColorsState} from '../app-state.reducer';
import {
    AssignMatchToTable,
    AssignToSecondTable,
    FreeTable,
    LoadTables,
    LockTable,
    PrintTable,
    ResultForMatch,
    TakeBackTable,
    UnLockTable
} from './redux/table.actions';
import {TableDto} from './tabledto.model';
import {TableMatchEvent} from './redux/table.match.event';
import {ResultModalComponent} from './table-list/result-modal/result-modal.component';
import {MzModalService} from 'ngx-materialize';
import {SelectMatchModalComponent} from './table-list/select-match-modal/select-match-modal.component';
import {TableService} from './table.service';
import {SelectTableModalComponent} from './table-list/select-table-modal/select-table-modal.component';
import {ToastrService} from 'ngx-toastr';
import {MatchToTable} from './table-list/tt-table/tt-table-content/matchtotable.model';

@Component({
    selector: 'toma-table-list-page',
    templateUrl: './table-list.page.component.html'
})
export class TableListPageComponent implements OnInit {

    tables: Observable<TableDto[]>;
    tablesLoading: Observable<boolean>;
    typeColor: Observable<string[]>;

    constructor(private store: Store<any>, private modalService: MzModalService,
                private tableService: TableService, private toastService: ToastrService) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadTables(null));
        this.tables = this.store.select(getTableState);
        this.tablesLoading = this.store.select(getTablesLoading);
        this.typeColor = this.store.select(getTypeColorsState);

    }

    onLockTable(tableNr: number) {
        this.store.dispatch(new LockTable(tableNr));
    }

    onUnLockTable(tableNr: number) {
        this.store.dispatch(new UnLockTable(tableNr));
    }

    onFreeTable(table: TableDto) {
        if (this.isSingleMatch(table)) {
            const freeTableEvent = new TableMatchEvent([table.matches[0].match.id], table.number);
            this.store.dispatch(new FreeTable(freeTableEvent));
            return;
        }
        this.selectMatchAndCallFunction(table, match => this.store.dispatch(
            new FreeTable(new TableMatchEvent(match.map(x => x.match.id), table.number))));
    }

    onTakeBackTable(table: TableDto) {
        if (this.isSingleMatch(table)) {
            const takeBackTableEvent = new TableMatchEvent([table.matches[0].match.id], table.number);
            this.store.dispatch(new TakeBackTable(takeBackTableEvent));
            return;
        }
        this.selectMatchAndCallFunction(table, match => this.store.dispatch(
            new TakeBackTable(new TableMatchEvent(match.map(x => x.match.id), table.number))));
    }

    onTableRefresh() {
        this.store.dispatch(new LoadTables(null));
    }

    onPrintTable(table: TableDto) {
        if (this.isSingleMatch(table)) {
            this.store.dispatch(new PrintTable({matchId: table.matches[0].match.id}));
        }
    }

    onAssignSecondTable(table: TableDto) {
        if (this.isSingleMatch(table)) {
            this.toastService.error('Ein Spiel kann nich auf zwei Tische gelegt werden.');
            return;
        }
        const selectedMatchIds = table.matches.map(match => match.match.id);
        this.tableService.getFreeTables().subscribe(this.onFreeTablesLoaded.bind(this, selectedMatchIds));
    }

    onFreeTablesLoaded(selectedMatchIds, tables: TableDto[]) {
        if (this.freeTablesAvailable(tables)) {
            const dialog: ComponentRef<SelectTableModalComponent> =
                <ComponentRef<SelectTableModalComponent>> this.modalService.open(SelectTableModalComponent);
            dialog.instance.tables = tables;
            dialog.instance.OnTableSelected.subscribe(tableNumber =>
                this.store.dispatch(new AssignToSecondTable({tableNr: tableNumber, matchIds: selectedMatchIds})));
            return;
        }
        this.toastService.error('Es sind keine freien Tische verfügbar.');
    }

    onResultForTable(table: TableDto) {
        if (this.isSingleMatch(table)) {
            const dialog: ComponentRef<ResultModalComponent> =
                <ComponentRef<ResultModalComponent>> this.modalService.open(ResultModalComponent);
            dialog.instance.currentMatch = table.matches[0];
            dialog.instance.OnResultForMatch.subscribe(match => this.store.dispatch(new ResultForMatch(match)));
            return;
        }
        this.toastService.error('Ergebnis für zwei Tische kann nicht eingegeben werden.');
    }

    private freeTablesAvailable(tables: TableDto[]) {
        return tables && tables.length > 0;
    }

    private isSingleMatch(table: TableDto) {
        return table.matches.length === 1;
    }

    private isSingleMatchOnTable(table: TableDto) {
        return table.matches.length !== 1;
    }

    onAssignMatchToTable(event: MatchToTable) {
        this.store.dispatch(new AssignMatchToTable(event));
    }

    private selectMatchAndCallFunction(table: TableDto, onMatchSelectedAction: any) {
        const dialog: ComponentRef<SelectMatchModalComponent> =
            <ComponentRef<SelectMatchModalComponent>> this.modalService.open(SelectMatchModalComponent);
        dialog.instance.matches = table.matches;
        dialog.instance.OnMatchesSelected.subscribe(onMatchSelectedAction);
    }


}
