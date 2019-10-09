import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Match} from '../../match/match.model';

@Component({
    selector: 'app-result-dialog',
    templateUrl: './result-dialog.component.html',
    styleUrls: ['./result-dialog.component.scss']
})
export class ResultDialogComponent {
    currentResult: any;

    constructor(
        public dialogRef: MatDialogRef<ResultDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public match: Match) {
        console.log(this.match);
    }

    onOk() {

    }

    onCancel() {
        this.dialogRef.close();
    }
}
