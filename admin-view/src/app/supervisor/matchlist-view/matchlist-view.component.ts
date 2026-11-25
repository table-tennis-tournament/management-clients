import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatchList } from '../matchlist.model';
import { MatchListItem } from '../matchlistitem.model';
import { Match } from '../../shared/data/match.model';
import { TypeColorMap } from '../../settings/settings.model';
import { isOpen } from '../../shared/match-state/match-state';
import { FormsModule } from '@angular/forms';
import { MatList } from '@angular/material/list';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TypeColorDirective } from '../../shared/directives/type-color.directive';
import { MatchlistSingleItemComponent } from './matchlist-single-item/matchlist-single-item.component';
import { MatchlistGroupItemComponent } from './matchlist-group-item/matchlist-group-item.component';

@Component({
  selector: 'toma-matchlist-view',
  templateUrl: './matchlist-view.component.html',
  styleUrls: ['./matchlist-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    MatList,
    CdkDropList,
    CdkDrag,
    TypeColorDirective,
    MatchlistSingleItemComponent,
    MatchlistGroupItemComponent,
  ],
})
export class MatchlistViewComponent {
  @Input()
  matchListMatches: MatchList[] = [];

  @Input()
  typeColors: TypeColorMap = {};

  @Output()
  matchListItemDelete = new EventEmitter<MatchList>();

  @Output()
  assignMatchListItem = new EventEmitter<MatchListItem>();

  @Output()
  moveMatchListItem = new EventEmitter<MatchListItem>();

  fixWaitingList = true;

  constructor() {}

  /** A drop of open matches from the discipline view, or a move of a match list item. */
  onDropSuccess(event: CdkDragDrop<MatchList[]>) {
    if (this.isMatchData(event.item.data)) {
      this.assignMatchesToMatchList(event.item.data, event.currentIndex);
      return;
    }

    const matchListItem = this.matchListMatches[event.previousIndex]?.matchListItem;
    if (!matchListItem) {
      return;
    }
    this.moveMatchListItem.emit({
      id: matchListItem.id,
      position: event.currentIndex,
    });
  }

  private isMatchData(data: any): data is Match[] {
    return data && data[0] && data[0].state !== undefined;
  }

  assignMatchesToMatchList(matches: Match[], index: number) {
    const matchListItem = {
      matchIds: matches
        .filter(isOpen)
        .map((match) => match.id)
        .filter((id): id is number => id != null),
      position: index,
    };
    this.assignMatchListItem.emit(matchListItem);
  }
}
