import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Game} from '../match/game.model';
import {Match} from '../match/match.model';
import {Player} from '../match/player.model';
import {GameDialogComponent} from './game-dialog/game-dialog.component';
import {GameService} from './game.service';
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

  constructor(public dialog: MatDialog, public gameService: GameService) {
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

  openResultDialog() {
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

  openGameDialog(playerWon: Player, isPlayerA: boolean) {
    const dialogRef = this.dialog.open(GameDialogComponent, {
      width: '400px',
      data: {
        player: playerWon,
        gameNr: this.getGameNumber(),
        isPlayerA
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        const newGame = this.gameService.createResult(result.result, result.isPlayerA);
        const newGames = this.currentMatch().result.games.concat(newGame);
        this.updateMatchResult.emit({
          matchId: this.currentMatch().match_id,
          result: {
            games: newGames
          }
        });
      }
    });
  }

  startMatch() {
    if (this.table.matches.length === 1) {
      this.startMatchOnTable.emit({
        tableId: this.table.table_id,
        matchId: this.table.matches[0].match_id
      });
      return;
    }
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
    const players = this.table.matches
      .map(match => match.players_a.concat(match.players_b))
      .reduce((first, second) => first.concat(second));
    const dialogRef = this.dialog.open(PlayerDialogComponent, {
      width: '400px',
      data: players
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.updateMatchResult.emit({
          playerIds: result,
          matchId: this.currentMatch().match_id
        });
      }
    });
  }


  endMatch() {
    this.finishMatch.emit(this.currentMatch());
  }

  private getGameNumber() {
    const games = this.currentMatch().result.games;
    for (let index = 0; index < games.length; index++) {
      if (this.gameService.gameHasNoResult(games[index])) {
        return index;
      }
    }
    return 0;
  }
}
