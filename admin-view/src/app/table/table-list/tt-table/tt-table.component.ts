import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableDto } from '../../tabledto.model';
import { MatchToTable } from './tt-table-content/matchtotable.model';

@Component({
    selector: 'toma-tt-table',
    templateUrl: './tt-table.component.html',
    styleUrls: ['./tt-table.component.scss'],
    standalone: false
})
export class TtTableComponent {
  @Input()
  table: TableDto;

  @Input()
  typeColor: string[];

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
}
