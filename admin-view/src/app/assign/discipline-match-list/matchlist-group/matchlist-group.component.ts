import { Component, Input } from '@angular/core';
import { MatchList } from '../../../supervisor/matchlist.model';

import { TypeColorMap } from '../../../settings/settings.model';

import { TypeColorDirective } from '../../../shared/directives/type-color.directive';

import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription,
} from '@angular/material/expansion';

import { MatList } from '@angular/material/list';

import { TeamItemComponent } from '../../../shared/team-item/team-item.component';

import { DisciplineTypePipe } from '../../../shared/pipes/discipline-type.pipe';

@Component({
  selector: 'toma-matchlist-group',
  templateUrl: './matchlist-group.component.html',
  styleUrls: ['./matchlist-group.component.scss'],
  imports: [
    TypeColorDirective,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatList,
    TeamItemComponent,
    DisciplineTypePipe,
  ],
})
export class MatchlistGroupComponent {
  constructor() {}

  @Input()
  matchListItem: MatchList;

  @Input()
  typeColors: TypeColorMap;

  isBlocked() {
    return this.matchListItem.matchinfo.filter((x) => !x.isPlayable).length > 0;
  }
}
