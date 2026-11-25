import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { Match } from '../../match/match.model';
import { formatResult, parseResult } from '../../../shared/result-entry/result-entry';
import { toGames, toSets } from '../../match/games';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatDivider } from '@angular/material/list';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { PlayerNamePipe } from '../../player-name.pipe';
import { ClubNamePipe } from '../../club-name.pipe';

@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html',
  styleUrls: ['./result-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDivider,
    MatFormField,
    MatInput,
    FormsModule,
    MatDialogActions,
    MatButton,
    PlayerNamePipe,
    ClubNamePipe,
  ],
})
export class ResultDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ResultDialogComponent>>(MatDialogRef);
  match = inject<Match>(MAT_DIALOG_DATA);

  resultString: string;

  ngOnInit(): void {
    this.resultString = formatResult(toSets(this.match.result?.games));
  }

  /** Closes with the entered (possibly interim) result; input with an invalid token is not accepted. */
  onOk() {
    const sets = parseResult(this.resultString);
    if (sets === null) {
      return;
    }
    this.dialogRef.close({ games: toGames(sets) });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
