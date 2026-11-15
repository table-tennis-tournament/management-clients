import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  matchWinner,
  SetScore,
  SetsWon,
  setsWon,
  setWinner,
  setWonBy,
  Side,
} from '../../shared/result-entry/result-entry';
import { toGames, toSets } from '../match/games';
import { callNumber, isAtTable, isBeingPlayed } from '../../shared/match-state/match-state';
import { Match } from '../match/match.model';
import { Player } from '../match/player.model';
import { GameDialogComponent } from './game-dialog/game-dialog.component';
import { ResultDialogComponent } from './result-dialog/result-dialog.component';
import { Table } from './table.model';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatBadge } from '@angular/material/badge';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatchItemComponent } from './match-item/match-item.component';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { ClubNamePipe } from '../club-name.pipe';
import { SinglePlayerPipe } from '../single-player.pipe';

interface Scoreboard {
  /** Always five Sets; Sets not played yet are 0:0 without a winner. */
  sets: (SetScore & { winner: Side | null })[];
  setsWon: SetsWon;
  winner: Side | null;
}

@Component({
  selector: 'app-tt-table',
  templateUrl: './tt-table.component.html',
  styleUrls: ['./tt-table.component.scss'],
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatBadge,
    MatChipSet,
    MatChip,
    MatCardContent,
    MatchItemComponent,
    NgClass,
    MatCardActions,
    MatButton,
    ClubNamePipe,
    SinglePlayerPipe,
  ],
})
export class TtTableComponent {
  dialog = inject(MatDialog);
  private _table: Table;

  /** The scoreboard of the started match, computed whenever the table changes. */
  scoreboard: Scoreboard | null = null;

  @Input()
  set table(table: Table) {
    this._table = table;
    this.scoreboard = this.buildScoreboard();
  }

  get table(): Table {
    return this._table;
  }

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
    return this.table.matches.find(isBeingPlayed);
  }

  isSecondCall() {
    return this.table.matches.find((match) => isAtTable(match) && callNumber(match) === 2);
  }

  isThirdCall() {
    return this.table.matches.find((match) => isAtTable(match) && callNumber(match) === 3);
  }

  tableHasStartedMatch(): boolean {
    return this.currentMatch() !== undefined;
  }

  private buildScoreboard(): Scoreboard | null {
    const match = this.table ? this.currentMatch() : undefined;
    if (!match) {
      return null;
    }
    const sets = toSets(match.result?.games);
    const empty: SetScore = { pointsPlayer1: 0, pointsPlayer2: 0 };
    return {
      sets: this.maxGames.map((index) => {
        const set = sets[index] ?? empty;
        return { ...set, winner: setWinner(set) };
      }),
      setsWon: setsWon(sets),
      winner: matchWinner(sets),
    };
  }

  openResultDialog() {
    const match = this.currentMatch();
    const dialogRef = this.dialog.open(ResultDialogComponent, {
      width: '400px',
      data: match,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateMatchResult.emit({
          matchId: match.match_id,
          result,
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
        isPlayerA,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newGame = toGames([setWonBy(result.isPlayerA ? 1 : 2, Number(result.result))]);
        const newGames = this.currentMatch().result.games.concat(newGame);
        this.updateMatchResult.emit({
          matchId: this.currentMatch().match_id,
          result: {
            games: newGames,
          },
        });
      }
    });
  }

  startMatch(matchId) {
    this.startMatchOnTable.emit({
      tableId: this.table.table_id,
      matchId,
    });
  }

  endMatch() {
    this.finishMatch.emit(this.currentMatch());
  }

  /** The index of the first Set without a winner, or 0. */
  private getGameNumber() {
    const index = toSets(this.currentMatch().result.games).findIndex((set) => setWinner(set) === null);
    return index >= 0 ? index : 0;
  }

  takeBack() {
    this.takeBackMatch.emit({ matchId: this.currentMatch().match_id });
  }
}
