import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Match} from '../../match/match.model';
import {GameService} from '../game.service';

@Component({
    selector: 'app-result-dialog',
    templateUrl: './result-dialog.component.html',
    styleUrls: ['./result-dialog.component.scss'],
    standalone: false
})
export class ResultDialogComponent implements OnInit {
    resultString: string;

    constructor(
        public dialogRef: MatDialogRef<ResultDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public match: Match,
        public gameService: GameService) {
    }

    ngOnInit(): void {
        this.resultString = '';
        this.match.result.games.forEach(game => {
            game.score_player_b < game.score_player_a ?
                this.resultString += game.score_player_b + ' ' :
                this.resultString += '-' + game.score_player_a + ' ';
        });
    }

    onOk() {
        this.dialogRef.close({
            games: this.gameService.getGames(this.resultString)
        });
    }

    onCancel() {
        this.dialogRef.close();
    }
}
