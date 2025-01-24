import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DisciplineStage } from '../models/discipline.stage.model';
import { Match } from '../../../shared/data/match.model';
import { MatchState } from '../../../shared/data/matchstate.model';

@Component({
    selector: 'toma-discipline-stage',
    templateUrl: './discipline-stage.component.html',
    styleUrls: ['./discipline-stage.component.scss'],
    standalone: false
})
export class DisciplineStageComponent {
  lineStageClass: string[] = ['first-stage', 'second-stage', 'third-stage', 'fourth-stage'];

  constructor() {}

  @Input()
  typeColor: string[];

  @Input()
  stage: DisciplineStage;

  @Input() index: number;

  @Output()
  resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Output()
  deleteStage: EventEmitter<DisciplineStage> = new EventEmitter<DisciplineStage>();

  isInWaitingListOrOnTableOrCallable(currentMatch: Match) {
    return (
      currentMatch.state === MatchState[MatchState.InWaitingList] ||
      currentMatch.state === MatchState[MatchState.Callable] ||
      currentMatch.state === MatchState[MatchState.OnTable] ||
      currentMatch.state === MatchState[MatchState.Started] ||
      currentMatch.state === MatchState[MatchState.SecondCall] ||
      currentMatch.state === MatchState[MatchState.ThirdCall]
    );
  }

  isMatchOpen(currentMatch: Match) {
    return currentMatch.state === MatchState[MatchState.Open];
  }
}
