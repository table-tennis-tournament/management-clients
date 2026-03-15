import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Game} from '../match/game.model';
import {Match} from '../match/match.model';
import {Player} from '../match/player.model';
import {GameDialogComponent} from './game-dialog/game-dialog.component';
import {GameService} from './game.service';
import {ResultDialogComponent} from './result-dialog/result-dialog.component';
import {Table} from './table.model';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatBadge } from '@angular/material/badge';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatchItemComponent } from './match-item/match-item.component';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { ClubNamePipe } from '../club-name.pipe';
import { SinglePlayerPipe } from '../single-player.pipe';

@Component({
    selector: 'app-tt-table',
    templateUrl: './tt-table.component.html',
    styleUrls: ['./tt-table.component.scss'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatBadge, MatChipSet, MatChip, MatCardContent, MatchItemComponent, NgClass, MatCardActions, MatButton, ClubNamePipe, SinglePlayerPipe]
})
export class TtTableComponent {
  dialog = inject(MatDialog);
  gameService = inject(GameService);


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

  @Output()
  takeBackMatch = new EventEmitter();

  maxGames = [0, 1, 2, 3, 4];

  currentMatch(): Match {
    return this.table.matches.find(match => match.state === 'Started');
  }

  isSecondCall() {
    return this.table.matches.find(match => match.state === 'SecondCall');
  }

  isThirdCall() {
    return this.table.matches.find(match => match.state === 'ThirdCall');
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

  openResultDialog() {
    const match = this.currentMatch();
    const dialogRef = this.dialog.open(ResultDialogComponent, {
      width: '400px',
      data: match
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateMatchResult.emit({
          matchId: match.match_id,
          result
        });
      }
    });
  }

  openGameDialog(playerWon: Player[], isPlayerA: boolean) {
    const dialogRef = this.dialog.open(GameDialogComponent, {
      width: '400px',
      data: {
        player: playerWon,
        gameNr: this.getGameNumber(),
        isPlayerA
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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

  startMatch(matchId) {
    this.startMatchOnTable.emit({
      tableId: this.table.table_id,
      matchId
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

  takeBack() {
    this.takeBackMatch.emit({matchId: this.currentMatch().match_id});
  }
}
