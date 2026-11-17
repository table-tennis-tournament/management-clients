import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { PlayerNamePipe } from '../../player-name.pipe';

/** Confirms the next Call of a match; a Call always announces all of its players. Closes with `true`. */
@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-dialog.component.html',
  styleUrls: ['./player-dialog.component.scss'],
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, PlayerNamePipe],
})
export class PlayerDialogComponent {
  dialogRef = inject<MatDialogRef<PlayerDialogComponent>>(MatDialogRef);
  players = inject(MAT_DIALOG_DATA);

  onOk() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
