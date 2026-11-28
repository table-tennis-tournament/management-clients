import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { TypeColorMap } from '../../settings/settings.model';
import { MatList, MatListItem } from '@angular/material/list';
import { TypeColorDirective } from '../../shared/directives/type-color.directive';
import { MinuteClock } from '../../shared/clock/minute-clock.service';
import { minutesSinceFirstCall } from '../../shared/match-state/match-state';

/** The requested Second and Third calls waiting for the caller, with the minutes since their first Call. */
@Component({
  selector: 'toma-player-calls',
  templateUrl: './player-calls.component.html',
  styleUrls: ['./player-calls.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatList, MatListItem, TypeColorDirective],
})
export class PlayerCallsComponent {
  private clock = inject(MinuteClock);

  @Input()
  secondCalls: MatchAggregate[] = [];

  @Input()
  thirdCalls: MatchAggregate[] = [];

  @Input()
  typeColors: TypeColorMap = {};

  @Output()
  matchesSelected: EventEmitter<MatchAggregate> = new EventEmitter<MatchAggregate>();

  waitingMinutes(aggregate: MatchAggregate): number {
    return minutesSinceFirstCall(aggregate, this.clock.now()) ?? 0;
  }
}
