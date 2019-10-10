import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ResultDialogComponent} from './result-dialog/result-dialog.component';
import {Table} from './table.model';
import {Game} from '../match/game.model';

@Component({
    selector: 'app-tt-table',
    templateUrl: './tt-table.component.html',
    styleUrls: ['./tt-table.component.scss']
})
export class TtTableComponent {

    @Input()
    table: Table;

    @Output()
    updateMatchResult = new EventEmitter();

    @Output()
    finishMatch = new EventEmitter();

    constructor(public dialog: MatDialog) {
    }

    allGames(): Game[] {
        return [0, 1, 2, 3, 4].map(index =>
            this.table.current_match.result.games.length > index
                ? this.table.current_match.result.games[index]
                : {
                    score_player_a: 0,
                    score_player_b: 0
                } as Game);
    }

    openDialog() {
        const dialogRef = this.dialog.open(ResultDialogComponent, {
            width: '400px',
            data: this.table.current_match
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!!result) {
                this.updateMatchResult.emit({
                    matchId: this.table.current_match.match_id,
                    result
                });
            }
        });
    }

    playerAWon(game: Game) {
        return game.score_player_a > game.score_player_b;
    }

    playerBWon(game: Game) {
        return game.score_player_b > game.score_player_a;
    }

    endMatch() {
        this.finishMatch.emit(this.table.current_match);
    }
}
