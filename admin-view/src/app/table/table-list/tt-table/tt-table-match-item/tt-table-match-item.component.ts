import { Component, Input } from '@angular/core';
import { Match } from '../../../../shared/data/match.model';

import { TtPlayerNameReducerPipe } from '../../../../shared/pipes/tt-player-name-reducer.pipe';

import { ResultPipe } from '../../../../shared/pipes/result.pipe';

@Component({
  selector: 'toma-tt-table-match-item',
  templateUrl: './tt-table-match-item.component.html',
  imports: [TtPlayerNameReducerPipe, ResultPipe],
})
export class TtTableMatchItemComponent {
  @Input()
  matches: Match[];
}
