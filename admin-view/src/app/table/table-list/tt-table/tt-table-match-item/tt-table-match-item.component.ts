import { Component, Input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Match } from '../../../../shared/data/match.model';
import { MinuteClock } from '../../../../shared/clock/minute-clock.service';
import { callNumber, isBeingPlayed, minutesSinceFirstCall } from '../../../../shared/match-state/match-state';

import { TtPlayerNameReducerPipe } from '../../../../shared/pipes/tt-player-name-reducer.pipe';

import { ResultPipe } from '../../../../shared/pipes/result.pipe';

/**
 * The match at a table: its stage, result and Sides. Once called, its Call and the minutes since the first Call,
 * so the administrator sees whom to end kampflos; once started, its current result (the Sets won and the points
 * of each Set) and when it started and for how long it has been running.
 */
@Component({
  selector: 'toma-tt-table-match-item',
  templateUrl: './tt-table-match-item.component.html',
  styles: ['.call-info, .set-points { font-size: small; } .last-call { color: red; font-weight: bold; }'],
  imports: [TtPlayerNameReducerPipe, ResultPipe, DatePipe],
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

  isPlaying(match: Match): boolean {
    return isBeingPlayed(match);
  }

  /** The points of each Set entered so far, e.g. `11:5 9:11`. */
  setPoints(match: Match): string {
    return (match.sets ?? []).map((set) => `${set.pointsPlayer1}:${set.pointsPlayer2}`).join(' ');
  }

  /** The whole minutes since the match was started, or `null` without a start time. */
  playingMinutes(match: Match): number | null {
    if (!match.startTime) {
      return null;
    }
    return Math.max(0, Math.floor((this.clock.now() - new Date(match.startTime).getTime()) / 60000));
  }
}
