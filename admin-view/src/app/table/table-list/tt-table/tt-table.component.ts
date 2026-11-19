import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableDto } from '../../tabledto.model';
import { MatchToTable } from './tt-table-content/matchtotable.model';
import { TypeColorMap } from '../../../settings/settings.model';
import { canUseSecondTable, matchesOnTwoTables } from '../../table-actions';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { TypeColorDirective } from '../../../shared/directives/type-color.directive';
import { TtTableContentComponent } from './tt-table-content/tt-table-content.component';
import { MatButton } from '@angular/material/button';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription,
} from '@angular/material/expansion';

@Component({
  selector: 'toma-tt-table',
  templateUrl: './tt-table.component.html',
  styleUrls: ['./tt-table.component.scss'],
  imports: [
    MatCard,
    TypeColorDirective,
    MatCardContent,
    TtTableContentComponent,
    MatCardActions,
    MatButton,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
  ],
})
export class TtTableComponent {
  @Input()
  table: TableDto;

  @Input()
  typeColors: TypeColorMap;

  @Output()
  resultForMatch = new EventEmitter<any>();

  @Output()
  tableAssigned = new EventEmitter<any>();

  @Output()
  selectMatch = new EventEmitter<any>();

  @Output()
  selectTable = new EventEmitter<any>();

  @Output()
  lockTable = new EventEmitter<number>();

  @Output()
  unLockTable = new EventEmitter<number>();

  @Output()
  freeTable = new EventEmitter<TableDto>();

  @Output()
  takeBackTable = new EventEmitter<TableDto>();

  @Output()
  printTable = new EventEmitter<TableDto>();

  @Output()
  assignSecondTable = new EventEmitter<TableDto>();

  @Output()
  resultForTable = new EventEmitter<TableDto>();

  @Output()
  assignMatchToTable = new EventEmitter<MatchToTable>();

  @Output()
  removeFromTable = new EventEmitter<TableDto>();

  @Output()
  refreshTables = new EventEmitter<any>();

  public isGameAvailable() {
    return this.table !== null && this.table.matches !== null && this.table.matches.length > 0;
  }

  /** "Entfernen" only takes a match off this table when it also waits at another one. */
  public hasMatchOnTwoTables() {
    return matchesOnTwoTables(this.table).length > 0;
  }

  public canUseSecondTable() {
    return canUseSecondTable(this.table);
  }
}
