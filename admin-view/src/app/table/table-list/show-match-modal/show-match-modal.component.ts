import { Component, EventEmitter, inject } from '@angular/core';
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

  public players: Player[];

  constructor() {
    this.players = null;
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
    const playerArray = [];
    this.currentTable.matches.forEach((match) => {
      const firstPlayer = match.team1;
      if (firstPlayer && !playerArray[firstPlayer[0].id]) {
        playerArray[firstPlayer[0].id] = match.team1[0];
      }
      const secondPlayer = match.team2;
      if (secondPlayer && !playerArray[secondPlayer[0].id]) {
        playerArray[secondPlayer[0].id] = match.team2[0];
      }
    });
    this.players = [];
    playerArray.forEach((player) => {
      if (player) {
        this.players.push(player);
      }
    });
  }
}
