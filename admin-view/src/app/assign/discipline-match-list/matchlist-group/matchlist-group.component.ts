import { Component, Input, OnInit } from '@angular/core';
import { MatchList } from '../../../supervisor/matchlist.model';
import { TypeColorMap } from '../../../settings/settings.model';

@Component({
  selector: 'toma-matchlist-group',
  templateUrl: './matchlist-group.component.html',
  styleUrls: ['./matchlist-group.component.scss'],
  standalone: false,
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
