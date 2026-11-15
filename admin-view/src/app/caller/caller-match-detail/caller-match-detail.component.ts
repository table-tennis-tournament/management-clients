import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { TypeColorMap } from '../../settings/settings.model';

@Component({
  selector: 'toma-caller-match-detail',
  templateUrl: './caller-match-detail.component.html',
  styleUrls: ['./caller-match-detail.component.scss'],
  standalone: false,
})
export class CallerMatchDetailComponent {
  @Input()
  typeColors: TypeColorMap;

  @Input()
  matchAggregate: MatchAggregate;

  @Output()
  matchCalled: EventEmitter<number[]> = new EventEmitter();

  onMatchCalled() {
    this.matchCalled.emit(this.matchAggregate.matches.map((match) => match.id));
  }
}
