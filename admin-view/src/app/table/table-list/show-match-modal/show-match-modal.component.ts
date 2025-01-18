import { Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { TableDto } from '../../tabledto.model';
import { Player } from '../../../shared/data/player.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'toma-show-match-modal',
    templateUrl: './show-match-modal.component.html',
    styleUrls: ['./show-match-modal.component.scss'],
    standalone: false
})
export class ShowMatchModalComponent {
  public OnTableCalled: EventEmitter<void> = new EventEmitter<void>();

  public players: Player[];

  constructor(
    public dialogRef: MatDialogRef<ShowMatchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public currentTable: TableDto
  ) {
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
