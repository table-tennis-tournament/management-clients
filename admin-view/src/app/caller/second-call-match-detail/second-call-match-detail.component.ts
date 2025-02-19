import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchAggregate } from '../../shared/data/match.aggregate';
import { MatchState } from '../../shared/data/matchstate.model';

@Component({
    selector: 'toma-second-call-match-detail',
    templateUrl: './second-call-match-detail.component.html',
    styleUrls: ['./second-call-match-detail.component.scss'],
    standalone: false
})
export class SecondCallMatchDetailComponent {
  @Input()
  typeColor: string[];

  @Input()
  matchAggregate: MatchAggregate;

  @Output()
  matchCalled: EventEmitter<number[]> = new EventEmitter();

  onMatchCalled() {
    this.matchCalled.emit(this.matchAggregate.matches.map((match) => match.id));
  }

  stateIsCallable() {
    const notCallableMatches = this.matchAggregate.matches
      .map((match) => match.state)
      .filter((state) => state !== MatchState.Callable.toString());
    return notCallableMatches.length < 1;
  }
}
