import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { TypeColorMap } from '../../settings/settings.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatList, MatListItem } from '@angular/material/list';
import { TypeColorDirective } from '../../shared/directives/type-color.directive';

@Component({
  selector: 'toma-caller-match-list',
  templateUrl: './caller-match-list.component.html',
  styleUrls: ['./caller-match-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatProgressSpinner, MatList, MatListItem, TypeColorDirective],
})
export class CallerMatchListComponent {
  @Input()
  matchAggregates: MatchAggregate[] = [];

  constructor() {}

  @Input()
  typeColors: TypeColorMap = {};

  @Input()
  matchesLoading: boolean = false;

  @Output()
  matchesSelected: EventEmitter<MatchAggregate> = new EventEmitter<MatchAggregate>();
}
