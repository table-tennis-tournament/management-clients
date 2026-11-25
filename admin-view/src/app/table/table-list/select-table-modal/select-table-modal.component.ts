import { Component, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

import { CdkScrollable } from '@angular/cdk/scrolling';

import { MatFormField, MatLabel } from '@angular/material/form-field';

import { MatSelect, MatOption } from '@angular/material/select';

import { MatButton } from '@angular/material/button';

@Component({
  selector: 'toma-select-table-modal',
  templateUrl: './select-table-modal.component.html',
  styleUrls: ['./select-table-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
})
export class SelectTableModalComponent {
  dialogRef = inject<MatDialogRef<SelectTableModalComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  public selectedTable: number;

  public OnTableSelected: EventEmitter<number> = new EventEmitter<number>();

  onCancel(): void {
    this.dialogRef.close();
  }

  onOk() {
    this.OnTableSelected.emit(this.selectedTable);
  }
}
