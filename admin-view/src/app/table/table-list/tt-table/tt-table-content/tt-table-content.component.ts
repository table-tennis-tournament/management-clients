import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableDto } from '../../../tabledto.model';
import { MatchToTable } from './matchtotable.model';
import { Match } from '../../../../shared/data/match.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'toma-tt-table-content',
  templateUrl: './tt-table-content.component.html',
  styleUrls: ['./tt-table-content.component.scss'],
  standalone: false,
})
export class TtTableContentComponent {
  @Input()
  table: TableDto;

  @Output()
  freeTable = new EventEmitter<number>();

  @Output()
  assignMatchToTable = new EventEmitter<MatchToTable>();

  private isDropDataValid(event) {
    return (!this.table.matches || !this.table.matches[0]) && event.item.data;
  }

  drop(event: CdkDragDrop<Match, Match>) {
    const droppedMatches: Match[] = event.item.data;
    if (this.isDropDataValid(event)) {
      this.assignMatchToTable.emit({
        matchIds: droppedMatches.map((match) => match.id),
        tableId: this.table.id,
        tableNr: this.table.number,
      });
    }
  }
}
