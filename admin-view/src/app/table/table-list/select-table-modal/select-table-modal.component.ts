import { Component, EventEmitter, Inject } from '@angular/core';
import { TableDto } from '../../tabledto.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'toma-select-table-modal',
    templateUrl: './select-table-modal.component.html',
    styleUrls: ['./select-table-modal.component.scss'],
    standalone: false
})
export class SelectTableModalComponent {
  public selectedTable: number;

  constructor(
    public dialogRef: MatDialogRef<SelectTableModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TableDto[]
  ) {}

  public OnTableSelected: EventEmitter<number> = new EventEmitter<number>();

  onCancel(): void {
    this.dialogRef.close();
  }

  onOk() {
    this.OnTableSelected.emit(this.selectedTable);
  }
}
