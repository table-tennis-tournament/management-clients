import { Component, Input, inject } from '@angular/core';
import { Match } from '../../../../shared/data/match.model';
import { MinuteClock } from '../../../../shared/clock/minute-clock.service';
import { callNumber, minutesSinceFirstCall } from '../../../../shared/match-state/match-state';

import { TtPlayerNameReducerPipe } from '../../../../shared/pipes/tt-player-name-reducer.pipe';

import { ResultPipe } from '../../../../shared/pipes/result.pipe';

/**
 * The match at a table: its stage, result and Sides and, once called, its Call and the minutes since the first
 * Call, so the administrator sees whom to end kampflos.
 */
@Component({
  selector: 'toma-tt-table-match-item',
  templateUrl: './tt-table-match-item.component.html',
  styles: ['.call-info { font-size: small; } .last-call { color: red; font-weight: bold; }'],
  imports: [TtPlayerNameReducerPipe, ResultPipe],
})
export class TtTableMatchItemComponent {
  private clock = inject(MinuteClock);

  @Input()
  matches: Match[];

  calls(match: Match): number {
    return callNumber(match);
  }

  waitingMinutes(match: Match): number {
    return minutesSinceFirstCall(match, this.clock.now()) ?? 0;
  }
}
