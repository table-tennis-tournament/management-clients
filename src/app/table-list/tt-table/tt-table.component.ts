import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Game} from '../match/game.model';
import {Match} from '../match/match.model';
import {PlayerDialogComponent} from './player-dialog/player-dialog.component';
import {ResultDialogComponent} from './result-dialog/result-dialog.component';
import {StartDialogComponent} from './start-dialog/start-dialog.component';
import {Table} from './table.model';

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

  @Output()
  callPlayersForMatch = new EventEmitter();

  maxGames = [0, 1, 2, 3, 4];

  constructor(public dialog: MatDialog) {
  }

  currentMatch(): Match {
    return this.table.matches.find(match => match.state === 'STARTED');
  }

  tableHasStartedMatch(): boolean {
    return this.currentMatch() !== undefined;
  }

  tableHasNoStartedAndAtLeastOneMatch(): boolean {
    return this.table.matches.length > 0 && !this.currentMatch();
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

  playerBWon(game: Game) {
    return game.score_player_b > game.score_player_a;
  }

  playerWonMatch(gamesWonPlayer: number) {
    return gamesWonPlayer === 3;
  }

  endMatch() {
    this.finishMatch.emit(this.currentMatch());
  }

  startMatch() {
    const dialogRef = this.dialog.open(StartDialogComponent, {
      width: '400px',
      data: this.table.matches.filter(match => match.state === 'ASSIGNED')
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

  callPlayer() {
    const dialogRef = this.dialog.open(PlayerDialogComponent, {
      width: '400px',
      data: [this.currentMatch().player_a, this.currentMatch().player_b]
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.callPlayersForMatch.emit({
          playerIds: result,
          matchId: this.currentMatch().match_id
        });
      }
    });
  }
}
