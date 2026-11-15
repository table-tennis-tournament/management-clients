import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { TypeColorMap } from '../../settings/settings.model';
import { MatCard, MatCardTitle, MatCardContent, MatCardActions, MatCardHeader } from '@angular/material/card';
import { TypeColorDirective } from '../../shared/directives/type-color.directive';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TtPlayerNameReducerPipe } from '../../shared/pipes/tt-player-name-reducer.pipe';

@Component({
  selector: 'toma-second-call-match-detail',
  templateUrl: './second-call-match-detail.component.html',
  styleUrls: ['./second-call-match-detail.component.scss'],
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
