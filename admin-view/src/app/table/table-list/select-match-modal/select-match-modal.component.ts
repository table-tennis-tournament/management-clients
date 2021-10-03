import {Component, Inject} from '@angular/core';
import {Match} from '../../../shared/data/match.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'toma-select-match-modal',
    templateUrl: './select-match-modal.component.html',
    styleUrls: ['./select-match-modal.component.scss']
})
export class SelectMatchModalComponent {

    currentValues: boolean[] = [];

    constructor(
        public dialogRef: MatDialogRef<SelectMatchModalComponent>,
        @Inject(MAT_DIALOG_DATA) public matches: Match[]) {
    }


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
