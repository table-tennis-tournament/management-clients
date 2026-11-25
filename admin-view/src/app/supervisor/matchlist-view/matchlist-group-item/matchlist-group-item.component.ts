import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatchList } from '../../matchlist.model';

import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';

import { MatList } from '@angular/material/list';

import { TeamItemComponent } from '../../../shared/team-item/team-item.component';

import { DisciplineTypePipe } from '../../../shared/pipes/discipline-type.pipe';

@Component({
  selector: 'toma-matchlist-group-item',
  templateUrl: './matchlist-group-item.component.html',
  styleUrls: ['./matchlist-group-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatExpansionPanel, MatExpansionPanelHeader, MatList, TeamItemComponent, DisciplineTypePipe],
})
export class MatchlistGroupItemComponent {
  @Input()
  matchListItem: MatchList;

  @Output()
  matchListItemDelete = new EventEmitter<MatchList>();

  constructor() {}
}
