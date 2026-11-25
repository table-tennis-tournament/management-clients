import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

import { CdkScrollable } from '@angular/cdk/scrolling';

import { FormsModule } from '@angular/forms';

import { MatButton } from '@angular/material/button';

import { TtPlayerNameReducerPipe } from '../../../shared/pipes/tt-player-name-reducer.pipe';

@Component({
  selector: 'toma-select-match-modal',
  templateUrl: './select-match-modal.component.html',
  styleUrls: ['./select-match-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    FormsModule,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TtPlayerNameReducerPipe,
  ],
})
export class SelectMatchModalComponent {
  dialogRef = inject<MatDialogRef<SelectMatchModalComponent>>(MatDialogRef);
  matches = inject(MAT_DIALOG_DATA);

  currentValues: boolean[] = [];

  getSelectedMatches() {
    // ugly solution because [(ngModel)]=match.isPlayable is not working
    const result = [];
    this.currentValues.forEach((x, index) => {
      if (x) {
        result.push(this.matches[index]);
      }
    });
    return result;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
