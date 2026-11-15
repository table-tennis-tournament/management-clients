import { Component, Inject } from '@angular/core';
import { Match } from '../../../shared/data/match.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  formatResult,
  isFinalResult,
  matchWinner,
  parseResult,
  SetScore,
  Side,
} from '../../../shared/result-entry/result-entry';
import { TTMatchResult } from './ttmatch-result.model';

/** Enters the final result of a match. Closes with a [TTMatchResult], or with nothing on cancel. */
@Component({
  selector: 'toma-result-modal',
  templateUrl: './result-modal.component.html',
  styleUrls: ['./result-modal.component.scss'],
  standalone: false,
})
export class ResultModalComponent {
  currentInput: string;
  sets: SetScore[] | null = [];
  winner: Side | null = null;

  constructor(
    public dialogRef: MatDialogRef<ResultModalComponent>,
    @Inject(MAT_DIALOG_DATA) public currentMatch: Match
  ) {
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
