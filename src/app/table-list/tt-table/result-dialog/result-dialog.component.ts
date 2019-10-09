import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Game} from '../../match/game.model';
import {Match} from '../../match/match.model';
import {Player} from '../../match/player.model';
import {Result} from '../../match/result.model';

@Component({
    selector: 'app-result-dialog',
    templateUrl: './result-dialog.component.html',
    styleUrls: ['./result-dialog.component.scss']
})
export class ResultDialogComponent implements OnInit {
    games: Game[];

    constructor(
        public dialogRef: MatDialogRef<ResultDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public match: Match, private fb: FormBuilder) {
    }

    onOk() {
        this.dialogRef.close({games: this.games});
    }

    onCancel() {
        this.dialogRef.close();
    }

    ngOnInit(): void {
        this.games = [];
        for (let index = 0; index < 5; index++) {
            this.games[index] = {};
            if (this.match.result[index]) {
                this.games[index].score_player_a = this.match.result.games[index].score_player_a;
                this.games[index].score_player_b = this.match.result.games[index].score_player_b;
            }
        }
    }
}
