import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import {Match} from '../../match/match.model';
import {GameService} from '../game.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatDivider } from '@angular/material/list';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { PlayerNamePipe } from '../../player-name.pipe';
import { ClubNamePipe } from '../../club-name.pipe';

@Component({
    selector: 'app-result-dialog',
    templateUrl: './result-dialog.component.html',
    styleUrls: ['./result-dialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDivider, MatFormField, MatInput, FormsModule, MatDialogActions, MatButton, PlayerNamePipe, ClubNamePipe]
})
export class ResultDialogComponent implements OnInit {
    dialogRef = inject<MatDialogRef<ResultDialogComponent>>(MatDialogRef);
    match = inject<Match>(MAT_DIALOG_DATA);
    gameService = inject(GameService);

    resultString: string;

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
