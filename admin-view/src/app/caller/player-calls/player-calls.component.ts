import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { TypeColorMap } from '../../settings/settings.model';

@Component({
  selector: 'toma-player-calls',
  templateUrl: './player-calls.component.html',
  styleUrls: ['./player-calls.component.scss'],
  standalone: false,
})
export class PlayerCallsComponent {
  @Input()
  secondCalls: MatchAggregate[];

  @Input()
  thirdCalls: MatchAggregate[];

  @Input()
  typeColors: TypeColorMap;

  @Output()
  matchesSelected: EventEmitter<MatchAggregate> = new EventEmitter<MatchAggregate>();

  constructor() {}

  getStartTime(currentMatch: MatchAggregate) {
    const date = new Date(currentMatch.startTime);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / 60000);
  }
}
