import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatchAggregate} from '../../shared/data/match.aggregate';

@Component({
  selector: 'toma-player-calls',
  templateUrl: './player-calls.component.html',
  styleUrls: ['./player-calls.component.scss']
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

  constructor() { }


}
