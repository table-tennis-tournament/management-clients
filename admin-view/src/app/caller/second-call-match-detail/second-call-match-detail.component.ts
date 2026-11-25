import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { TypeColorMap } from '../../settings/settings.model';
import { MatCard, MatCardTitle, MatCardContent, MatCardActions, MatCardHeader } from '@angular/material/card';
import { TypeColorDirective } from '../../shared/directives/type-color.directive';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TtPlayerNameReducerPipe } from '../../shared/pipes/tt-player-name-reducer.pipe';
import { MinuteClock } from '../../shared/clock/minute-clock.service';
import { minutesSinceFirstCall } from '../../shared/match-state/match-state';

/** The Second or Third call the caller announces next: only the players who have not appeared. */
@Component({
  selector: 'toma-second-call-match-detail',
  templateUrl: './second-call-match-detail.component.html',
  styleUrls: ['./second-call-match-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    TypeColorDirective,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatCardHeader,
    MatIcon,
    TtPlayerNameReducerPipe,
  ],
})
export class SecondCallMatchDetailComponent {
  private clock = inject(MinuteClock);

  @Input()
  typeColors: TypeColorMap;

  @Input()
  matchAggregate: MatchAggregate;

  @Output()
  matchCalled: EventEmitter<number[]> = new EventEmitter();

  /** Minutes since the first Call, `null` without one. */
  waitingMinutes(): number | null {
    return minutesSinceFirstCall(this.matchAggregate, this.clock.now());
  }

  onMatchCalled() {
    this.matchCalled.emit(this.matchAggregate.matches.map((match) => match.id));
  }
}
