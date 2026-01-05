import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableDto } from '../tabledto.model';
import { MatchToTable } from './tt-table/tt-table-content/matchtotable.model';
import { TypeColorMap } from '../../settings/settings.model';

@Component({
  selector: 'toma-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss'],
  standalone: false,
})
export class TableListComponent {
  @Input()
  tables: TableDto[];

  @Input()
  tablesLoading: boolean;

  @Input()
  typeColors: TypeColorMap;

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
}
