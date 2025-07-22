import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Match} from '../../match/match.model';

@Component({
    selector: 'app-start-dialog',
    templateUrl: './start-dialog.component.html',
    styleUrls: ['./start-dialog.component.scss']
})
export class StartDialogComponent {
    selectedMatch: Match;

    constructor(
        public dialogRef: MatDialogRef<StartDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public matches: Match[]) {
    }

    onCancel() {
        this.dialogRef.close();
    }

    onOk() {
        this.dialogRef.close(this.selectedMatch.match_id);
    }
}
