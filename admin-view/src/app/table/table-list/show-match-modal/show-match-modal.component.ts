import { Component, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { TableDto } from '../../tabledto.model';

import { Player } from '../../../shared/data/player.model';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

import { CdkScrollable } from '@angular/cdk/scrolling';

import { MatButton } from '@angular/material/button';

import { TtPlayerNameReducerPipe } from '../../../shared/pipes/tt-player-name-reducer.pipe';

@Component({
  selector: 'toma-show-match-modal',
  templateUrl: './show-match-modal.component.html',
  styleUrls: ['./show-match-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TtPlayerNameReducerPipe,
  ],
})
export class ShowMatchModalComponent {
  dialogRef = inject<MatDialogRef<ShowMatchModalComponent>>(MatDialogRef);
  currentTable = inject<TableDto>(MAT_DIALOG_DATA);

  public OnTableCalled: EventEmitter<void> = new EventEmitter<void>();

  /** The players of a group at the table, each once; null for a single match. */
  public players: Player[] | null = null;

  constructor() {
    if (this.isGroupOfMatches()) {
      this.setPlayers();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private isGroupOfMatches() {
    return this.currentTable.matches && this.currentTable.matches.length > 1;
  }

  setPlayers() {
    // indexed by player id, so the players come out sorted by id
    const playerArray: Player[] = [];
    this.currentTable.matches.forEach((match) => {
      for (const player of [match.team1?.[0], match.team2?.[0]]) {
        if (player?.id != null && !playerArray[player.id]) {
          playerArray[player.id] = player;
        }
      }
    });
    const players: Player[] = [];
    this.players = players;
    playerArray.forEach((player) => {
      if (player) {
        players.push(player);
      }
    });
  }
}
