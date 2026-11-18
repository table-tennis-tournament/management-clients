import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { getTablesLoading, getTableState, getTypeColorsMapState } from '../app-state.reducer';

import { TypeColorMap } from '../settings/settings.model';

import {
  AssignMatchToTable,
  AssignToSecondTable,
  FreeTable,
  LoadTables,
  LockTable,
  PrintTable,
  RemoveMatchFromTable,
  ResultForMatch,
  TakeBackTable,
  UnLockTable,
  WalkoverMatches,
} from './redux/table.actions';

import { canUseSecondTable, matchesOnTwoTables } from './table-actions';

import { Match } from '../shared/data/match.model';

import { TableDto } from './tabledto.model';

import { TableMatchEvent } from './redux/table.match.event';

import { ResultModalComponent } from './table-list/result-modal/result-modal.component';

import { SelectMatchModalComponent } from './table-list/select-match-modal/select-match-modal.component';

import { TableService } from './table.service';

import { SelectTableModalComponent } from './table-list/select-table-modal/select-table-modal.component';

import { ToastrService } from 'ngx-toastr';

import { MatchToTable } from './table-list/tt-table/tt-table-content/matchtotable.model';

import { MatDialog } from '@angular/material/dialog';

import { TableListComponent } from './table-list/table-list.component';

import { MatFabButton } from '@angular/material/button';

import { MatIcon } from '@angular/material/icon';

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'toma-table-list-page',
  templateUrl: './table-list.page.component.html',
  imports: [TableListComponent, MatFabButton, MatIcon, AsyncPipe],
})
export class TableListPageComponent implements OnInit {
  private store = inject<Store<any>>(Store);
  private tableService = inject(TableService);
  private toastService = inject(ToastrService);
  dialog = inject(MatDialog);

  tables: Observable<TableDto[]>;
  tablesLoading: Observable<boolean>;
  typeColors: Observable<TypeColorMap>;

  ngOnInit() {
    this.tables = this.store.select(getTableState);
    this.tablesLoading = this.store.select(getTablesLoading);
    this.typeColors = this.store.select(getTypeColorsMapState);
  }

  onLockTable(tableNr: number) {
    this.store.dispatch(new LockTable(tableNr));
  }

  onUnLockTable(tableNr: number) {
    this.store.dispatch(new UnLockTable(tableNr));
  }

  onFreeTable(table: TableDto) {
    this.chooseMatches(table.matches, (matchIds) =>
      this.store.dispatch(new FreeTable(new TableMatchEvent(matchIds, table.id)))
    );
  }

  onTakeBackTable(table: TableDto) {
    this.chooseMatches(table.matches, (matchIds) =>
      this.store.dispatch(new TakeBackTable(new TableMatchEvent(matchIds, table.id)))
    );
  }

  /** "Kampflos": the chosen matches end unplayed, without a result. */
  onWalkover(table: TableDto) {
    this.chooseMatches(table.matches, (matchIds) =>
      this.store.dispatch(new WalkoverMatches(new TableMatchEvent(matchIds, table.id)))
    );
  }

  /** "Entfernen": a match that waits at two tables leaves this one and stays at the other. */
  onRemoveFromTable(table: TableDto) {
    this.chooseMatches(matchesOnTwoTables(table), (matchIds) =>
      this.store.dispatch(new RemoveMatchFromTable(new TableMatchEvent(matchIds, table.id)))
    );
  }

  onTableRefresh() {
    this.store.dispatch(new LoadTables(null));
  }

  onPrintTable(table: TableDto) {
    if (this.isSingleMatchOnTable(table)) {
      this.store.dispatch(new PrintTable({ matchId: table.matches[0].id }));
    }
  }

  /** "2.Tisch": the group's matches wait at a second, free table as well. */
  onAssignSecondTable(table: TableDto) {
    if (!canUseSecondTable(table)) {
      this.toastService.error('Nur eine Gruppe mit mindestens vier Spielern kann an zwei Tischen spielen.');
      return;
    }
    const selectedMatchIds = table.matches.map((match) => match.id);
    this.tableService.getFreeTables().subscribe((tables) => this.onFreeTablesLoaded(selectedMatchIds, tables));
  }

  onFreeTablesLoaded(selectedMatchIds: number[], tables: TableDto[]) {
    if (!this.freeTablesAvailable(tables)) {
      this.toastService.error('Es sind keine freien Tische verfügbar.');
      return;
    }
    const dialogRef = this.dialog.open(SelectTableModalComponent, {
      width: '250px',
      data: tables,
    });
    dialogRef.afterClosed().subscribe((tableNumber) => {
      if (tableNumber != null) {
        this.store.dispatch(new AssignToSecondTable({ tableNr: tableNumber, matchIds: selectedMatchIds }));
      }
    });
  }

  onResultForTable(table: TableDto) {
    if (this.isSingleMatchOnTable(table)) {
      const dialogRef = this.dialog.open(ResultModalComponent, {
        width: '500px',
        data: table.matches[0],
      });

      dialogRef.afterClosed().subscribe((matchResult) => {
        if (matchResult) {
          this.store.dispatch(new ResultForMatch(matchResult));
        }
      });
      return;
    }
    this.toastService.error('Ergebnis für zwei Tische kann nicht eingegeben werden.');
  }

  private freeTablesAvailable(tables: TableDto[]) {
    return tables && tables.length > 0;
  }

  private isSingleMatchOnTable(table: TableDto) {
    return table.matches.length === 1;
  }

  onAssignMatchToTable(event: MatchToTable) {
    this.store.dispatch(new AssignMatchToTable(event));
  }

  /** Runs [onChosen] with the one match, or with the matches chosen in a dialog when there are several. */
  private chooseMatches(matches: Match[], onChosen: (matchIds: number[]) => void) {
    if (matches.length === 1) {
      onChosen([matches[0].id]);
      return;
    }
    const dialogRef = this.dialog.open(SelectMatchModalComponent, {
      width: '400px',
      data: matches,
    });
    dialogRef.afterClosed().subscribe((chosen: Match[] | undefined) => {
      if (chosen?.length) {
        onChosen(chosen.map((match) => match.id));
      }
    });
  }
}
