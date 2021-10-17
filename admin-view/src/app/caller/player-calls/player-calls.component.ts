import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import * as moment from 'moment';

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
    const date = moment(currentMatch.startTime, 'DD/MM/YYYY HH:mm:ss').add(1, 'hours');
    const now = moment().add(1, 'hours');
    const duration = moment.duration(now.diff(date));
    return Math.floor(duration.asMinutes());
  }
}
