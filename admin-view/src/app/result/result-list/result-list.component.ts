import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Match } from '../../shared/data/match.model';
import { Discipline } from '../../discipline/discipline.model';
import { isFinalResult, matchWinner, parseResult, SetScore, Side } from '../../shared/result-entry/result-entry';
import { TTMatchResult } from '../../table/table-list/result-modal/ttmatch-result.model';
import { isFinished } from '../../shared/match-state/match-state';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DisciplineSelectComponent } from '../../discipline/discipline-select/discipline-select.component';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TeamItemComponent } from '../../shared/team-item/team-item.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DisciplinePipe } from '../pipes/discipline.pipe';
import { StagePipe } from '../pipes/stage.pipe';

@Component({
  selector: 'toma-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatProgressSpinner,
    DisciplineSelectComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatMiniFabButton,
    MatIcon,
    TeamItemComponent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DisciplinePipe,
    StagePipe,
  ],
})
export class ResultListComponent {
  private _matches: Match[] = [];
  selectedDisciplineId = 0;

  displayedColumns: string[] = ['back', 'id', 'player1', 'player2', 'type', 'discipline', 'fastCapture', 'endCapture'];

  /** The Sets typed into each row's quick-entry input, by row index. */
  enteredSets: (SetScore[] | null)[] = [];
  /** The winner of each row's entered Sets, by row index. */
  enteredWinners: (Side | null)[] = [];

  @Input()
  set matches(value: Match[]) {
    this._matches = value;
    this.onTypeChanged(this.selectedDisciplineId);
  }

  get matches() {
    return this._matches;
  }

  @Input()
  disciplines: Discipline[] = [];

  @Output()
  takeBackMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Output()
  resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

  @Output()
  resultCompleteForMatch: EventEmitter<TTMatchResult> = new EventEmitter<TTMatchResult>();

  @Output()
  refreshResultList: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  matchesLoading: boolean = false;

  selectedMatches: Match[] = [];

  onTypeChanged(disciplineId: number) {
    this.selectedDisciplineId = disciplineId;
    if (disciplineId === 0) {
      this.setSelectedMatchesOnChange(this.matches.filter(this.matchIsReadyForResult));
      return;
    }
    const filteredMatches = this.matches
      .filter((match) => match.type?.id === disciplineId)
      .filter(this.matchIsReadyForResult);
    this.setSelectedMatchesOnChange(filteredMatches);
  }

  private setSelectedMatchesOnChange(filteredMatches: Match[]) {
    if (filteredMatches.length !== this.selectedMatches.length) {
      this.selectedMatches = filteredMatches;
    }
    this.selectedMatches = filteredMatches;
  }

  /** Freed matches (Finished, no played result yet) wait here for their result. */
  matchIsReadyForResult(match: Match) {
    return isFinished(match);
  }

  onKeyUp(input: string, index: number) {
    this.enteredSets[index] = parseResult(input);
    this.enteredWinners[index] = matchWinner(this.enteredSets[index]);
  }

  checkResultAndClose(sets: SetScore[] | null, match: Match) {
    if (sets !== null && isFinalResult(sets)) {
      this.resultCompleteForMatch.emit({ result: sets, match });
      this.enteredSets = [];
      this.enteredWinners = [];
    }
  }
}
