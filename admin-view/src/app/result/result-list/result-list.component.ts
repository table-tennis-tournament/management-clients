import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { Discipline } from '../../discipline/discipline.model';
import { MatchState } from '../../shared/data/matchstate.model';
import { ResultCheckerService } from '../../table/table-list/result-modal/result-checker.service';
import { ResultCheckModel } from '../../table/table-list/result-modal/result-check.model';

@Component({
    selector: 'toma-result-list',
    templateUrl: './result-list.component.html',
    styleUrls: ['./result-list.component.scss'],
    standalone: false
})
export class ResultListComponent {
  private _matches: Match[];
  selectedDisciplineId = 0;

  displayedColumns: string[] = ['back', 'id', 'player1', 'player2', 'type', 'discipline', 'fastCapture', 'endCapture'];

  checkerResultList: ResultCheckModel[] = [];

  @Input()
  set matches(value: Match[]) {
    this._matches = value;
    this.onTypeChanged(this.selectedDisciplineId);
  }

  get matches() {
    return this._matches;
  }

  @Input()
  disciplines: Discipline[];

  @Output()
  takeBackMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Output()
  resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Output()
  resultCompleteForMatch: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  refreshResultList: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  matchesLoading: boolean;

  selectedMatches: Match[] = [];

  constructor(private resultChecker: ResultCheckerService) {}

  onTypeChanged(disciplineId) {
    this.selectedDisciplineId = disciplineId;
    if (disciplineId === 0) {
      this.setSelectedMatchesOnChange(this.matches.filter(this.matchIsReadyForResult));
      return;
    }
    const filteredMatches = this.matches
      .filter((match) => match.type.id === disciplineId)
      .filter(this.matchIsReadyForResult);
    this.setSelectedMatchesOnChange(filteredMatches);
  }

  private setSelectedMatchesOnChange(filteredMatches) {
    if (filteredMatches.length !== this.selectedMatches.length) {
      this.selectedMatches = filteredMatches;
    }
    this.selectedMatches = filteredMatches;
  }

  matchIsReadyForResult(match: Match) {
    return match.state === MatchState[MatchState.Finished];
  }

  onKeyUp(input: string, index: number) {
    const result = this.resultChecker.checkResult(input);
    this.checkerResultList[index] = result;
  }

  checkResultAndClose(checkerResult: ResultCheckModel, match: Match) {
    if (checkerResult.secondPlayerWinning || checkerResult.firstPlayerWinning) {
      this.resultCompleteForMatch.emit({
        result: checkerResult.currentResult,
        match: match,
      });
      this.checkerResultList = [];
    }
  }
}
