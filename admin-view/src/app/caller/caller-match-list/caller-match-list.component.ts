import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';

@Component({
  selector: 'toma-caller-match-list',
  templateUrl: './caller-match-list.component.html',
  styleUrls: ['./caller-match-list.component.scss'],
})
export class CallerMatchListComponent {
  @Input()
  matchAggregates: MatchAggregate[];

  constructor() {}

  @Input()
  typeColor: string[];

  @Input()
  matchesLoading: boolean;

  @Output()
  matchesSelected: EventEmitter<MatchAggregate> = new EventEmitter<MatchAggregate>();
}
