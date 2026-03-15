import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import {Match} from '../../match/match.model';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { PlayerNamePipe } from '../../player-name.pipe';

@Component({
    selector: 'app-start-dialog',
    templateUrl: './start-dialog.component.html',
    styleUrls: ['./start-dialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatRadioGroup, FormsModule, MatRadioButton, MatDialogActions, MatButton, PlayerNamePipe]
})
export class StartDialogComponent {
    dialogRef = inject<MatDialogRef<StartDialogComponent>>(MatDialogRef);
    matches = inject(MAT_DIALOG_DATA);

    selectedMatch: Match;

    onCancel() {
        this.dialogRef.close();
    }

    onOk() {
        this.dialogRef.close(this.selectedMatch.match_id);
    }
}
