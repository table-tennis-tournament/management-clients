import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatchList } from '../../matchlist.model';

import { TeamItemComponent } from '../../../shared/team-item/team-item.component';

import { DisciplineTypePipe } from '../../../shared/pipes/discipline-type.pipe';

@Component({
  selector: 'toma-matchlist-single-item',
  templateUrl: './matchlist-single-item.component.html',
  styleUrls: ['./matchlist-single-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TeamItemComponent, DisciplineTypePipe],
})
export class MatchlistSingleItemComponent {
  @Input({ required: true })
  matchListItem!: MatchList;

  @Output()
  matchListItemDelete = new EventEmitter<MatchList>();

  constructor() {}
}
