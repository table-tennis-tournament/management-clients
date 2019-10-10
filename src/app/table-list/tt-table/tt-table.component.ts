import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Game} from '../match/game.model';
import {Result} from '../match/result.model';
import {ResultDialogComponent} from './result-dialog/result-dialog.component';
import {StartDialogComponent} from './start-dialog/start-dialog.component';
import {Table} from './table.model';
import { Match } from '../match/match.model';

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

    @Output()
    startMatchOnTable = new EventEmitter();

    maxGames = [0, 1, 2, 3, 4];

    constructor(public dialog: MatDialog) {
    }

    currentMatch(): Match {
        return this.table.matches.find(match => match.state === 'STARTED');
    }

    tableHasStartedMatch(): boolean {
        return this.currentMatch() !== undefined;
    }

    allGames(): Game[] {
        if (this.tableHasStartedMatch()) {
            const match = this.currentMatch();
            return this.maxGames.map(index =>
                match.result.games.length > index
                    ? match.result.games[index]
                    : {
                        score_player_a: 0,
                        score_player_b: 0
                    } as Game);
        } else {
            return [];
        }
    }

    openDialog() {
        const match = this.currentMatch();
        const dialogRef = this.dialog.open(ResultDialogComponent, {
            width: '400px',
            data: match
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!!result) {
                this.updateMatchResult.emit({
                    matchId: match.match_id,
                    result
                });
            }
        });
    }

    playerAWon(game: Game) {
        return game.score_player_a > game.score_player_b;
    }

    playerAWonMatch(result: Result) {
        return result.games_won_player_a === 3;
    }

    playerBWonMatch(result: Result) {
        return result.games_won_player_b === 3;
    }

    playerBWon(game: Game) {
        return game.score_player_b > game.score_player_a;
    }

    endMatch() {
        this.finishMatch.emit(this.currentMatch());
    }

    startMatch() {
        const dialogRef = this.dialog.open(StartDialogComponent, {
            width: '400px',
            data: this.table.matches
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!!result) {
                this.startMatchOnTable.emit({
                    tableId: this.table.table_id,
                    matchId: result
                });
            }
        });
    }
}
