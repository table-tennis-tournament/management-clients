import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { TypeColorMap } from '../../settings/settings.model';

@Component({
  selector: 'toma-caller-match-list',
  templateUrl: './caller-match-list.component.html',
  styleUrls: ['./caller-match-list.component.scss'],
  standalone: false,
})
export class CallerMatchListComponent {
  @Input()
  matchAggregates: MatchAggregate[];

  constructor() {}

  @Input()
  typeColors: TypeColorMap;

  @Input()
  matchesLoading: boolean;

  @Output()
  matchesSelected: EventEmitter<MatchAggregate> = new EventEmitter<MatchAggregate>();
}
