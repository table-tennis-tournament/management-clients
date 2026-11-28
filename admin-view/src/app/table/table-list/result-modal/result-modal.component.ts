import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { ResultModalData, TTMatchResult } from './ttmatch-result.model';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { TtPlayerNameReducerPipe } from '../../../shared/pipes/tt-player-name-reducer.pipe';
import { TtMatchDisciplinePipe } from '../../../shared/pipes/tt-match-discipline.pipe';

/**
 * Enters the final result of a match. Closes with a [TTMatchResult], or with nothing on cancel. Where
 * [ResultModalData.kampflosAllowed], the result can be marked kampflos: the match becomes a Walkover won by the
 * Side that was there, entered as `0 0 0` (or `-0 -0 -0`).
 */
@Component({
  selector: 'toma-result-modal',
  templateUrl: './result-modal.component.html',
  styleUrls: ['./result-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
    MatCheckbox,
    MatDialogClose,
    TtPlayerNameReducerPipe,
    TtMatchDisciplinePipe,
  ],
})
export class ResultModalComponent {
  dialogRef = inject<MatDialogRef<ResultModalComponent>>(MatDialogRef);
  private data = inject<ResultModalData>(MAT_DIALOG_DATA);
  currentMatch: Match = this.data.match;
  kampflosAllowed = this.data.kampflosAllowed ?? false;

  currentInput: string;
  kampflos = false;
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
    if (this.sets === null || this.resultNotValid()) {
      return undefined;
    }
    return { result: this.sets, match: this.currentMatch, kampflos: this.kampflos };
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
