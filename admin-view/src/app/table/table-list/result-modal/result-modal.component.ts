import { Component, inject } from '@angular/core';
import { Match } from '../../../shared/data/match.model';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {
  formatResult,
  isFinalResult,
  matchWinner,
  parseResult,
  SetScore,
  Side,
} from '../../../shared/result-entry/result-entry';
import { TTMatchResult } from './ttmatch-result.model';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TtPlayerNameReducerPipe } from '../../../shared/pipes/tt-player-name-reducer.pipe';
import { TtMatchDisciplinePipe } from '../../../shared/pipes/tt-match-discipline.pipe';

/** Enters the final result of a match. Closes with a [TTMatchResult], or with nothing on cancel. */
@Component({
  selector: 'toma-result-modal',
  templateUrl: './result-modal.component.html',
  styleUrls: ['./result-modal.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TtPlayerNameReducerPipe,
    TtMatchDisciplinePipe,
  ],
})
export class ResultModalComponent {
  dialogRef = inject<MatDialogRef<ResultModalComponent>>(MatDialogRef);
  currentMatch = inject<Match>(MAT_DIALOG_DATA);

  currentInput: string;
  sets: SetScore[] | null = [];
  winner: Side | null = null;

  constructor() {
    const currentMatch = this.currentMatch;

    this.currentInput = formatResult(currentMatch.sets);
    this.onKeyUp(this.currentInput);
  }

  onKeyUp(value: string) {
    this.sets = parseResult(value);
    this.winner = matchWinner(this.sets);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getResult(): TTMatchResult | undefined {
    if (this.resultNotValid()) {
      return undefined;
    }
    return { result: this.sets, match: this.currentMatch };
  }

  resultNotValid(): boolean {
    return !isFinalResult(this.sets);
  }

  onEnter() {
    if (this.resultNotValid()) {
      return;
    }
    this.dialogRef.close(this.getResult());
  }
}
