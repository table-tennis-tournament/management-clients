import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';

@Component({
  selector: 'toma-player-calls',
  templateUrl: './player-calls.component.html',
  styleUrls: ['./player-calls.component.scss'],
})
export class PlayerCallsComponent {
  @Input()
  secondCalls: MatchAggregate[];

  @Input()
  thirdCalls: MatchAggregate[];

  @Input()
  typeColor: string[];

  @Output()
  matchesSelected: EventEmitter<MatchAggregate> = new EventEmitter<MatchAggregate>();

  constructor() {}

  getStartTime(currentMatch: MatchAggregate) {
    const date = new Date(currentMatch.startTime);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / 60000);
  }
}
