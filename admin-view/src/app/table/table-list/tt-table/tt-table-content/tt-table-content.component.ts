import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { TableDto } from '../../../tabledto.model';
import { MatchToTable } from './matchtotable.model';
import { Match } from '../../../../shared/data/match.model';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { MatCardHeader, MatCardTitle } from '@angular/material/card';
import { TtTableMatchItemComponent } from '../tt-table-match-item/tt-table-match-item.component';
import { ShortNameMap } from '../../../../settings/settings.model';
import { DisciplineNamePipe } from '../../../../shared/pipes/discipline-name.pipe';

@Component({
  selector: 'toma-tt-table-content',
  templateUrl: './tt-table-content.component.html',
  styleUrls: ['./tt-table-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatCardHeader, MatCardTitle, TtTableMatchItemComponent, CdkDropList, DisciplineNamePipe],
})
export class TtTableContentComponent {
  @Input({ required: true })
  table!: TableDto;

  /** The table card has little room: it shows a discipline's short name where it has one. */
  @Input()
  shortNames: ShortNameMap = {};

  @Output()
  freeTable = new EventEmitter<number>();

  @Output()
  assignMatchToTable = new EventEmitter<MatchToTable>();

  private isDropDataValid(event: CdkDragDrop<Match, Match>) {
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
