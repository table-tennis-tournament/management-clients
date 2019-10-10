import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Match} from '../../match/match.model';

@Component({
    selector: 'app-result-dialog',
    templateUrl: './result-dialog.component.html',
    styleUrls: ['./result-dialog.component.scss']
})
export class ResultDialogComponent implements OnInit {
    gameControls: FormArray;
    gamesForm: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<ResultDialogComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public match: Match) {
        console.log(this.match);
    }

    ngOnInit(): void {
        const gameFormConfig = {
            score_player_a: [],
            score_player_b: []
        };
        this.gameControls = this.fb.array([1, 2, 3, 4, 5].map(index =>
            this.fb.group(gameFormConfig)
        ));
        this.gamesForm = this.fb.group({
            result: this.gameControls
        });
        if (!!this.match.result) {
            this.match.result.games.forEach((game, index) => {
                this.gameControls.controls[index].patchValue(game);
            });
        }
    }

    onOk() {
        this.dialogRef.close({
            games: this.gamesForm.value.result
                .filter(game => game.score_player_a !== undefined &&
                    game.score_player_a !== null &&
                    game.score_player_b !== null &&
                    game.score_player_b !== undefined)
        });
    }

    onCancel() {
        this.dialogRef.close();
    }
}
