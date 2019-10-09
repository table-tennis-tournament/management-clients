import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Match} from '../../match/match.model';

@Component({
    selector: 'app-result-dialog',
    templateUrl: './result-dialog.component.html'
})
export class ResultDialogComponent implements OnInit {
    currentResult: any;

    constructor(
        public dialogRef: MatDialogRef<ResultDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Match) {
    }


    ngOnInit() {
    }

    onOk() {

    }

    onCancel() {
        this.dialogRef.close();
    }
}
