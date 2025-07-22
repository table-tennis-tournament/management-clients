import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {GameData} from './gamedata.model';

@Component({
  selector: 'app-game-dialog',
  templateUrl: './game-dialog.component.html',
  styleUrls: ['./game-dialog.component.scss']
})
export class GameDialogComponent implements OnInit {
  public resultString: string;

  constructor(
    public dialogRef: MatDialogRef<GameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public gameData: GameData
  ) {
  }

  ngOnInit(): void {
    this.resultString = '';
  }

  onOk() {
    if (this.isNumber(this.resultString)) {
      this.dialogRef.close({
        result: this.resultString,
        gameNr: this.gameData.gameNr,
        isPlayerA: this.gameData.isPlayerA
      });
    }
  }


  isNumber(value: string | number): boolean {
    return ((value != null) && !isNaN(Number(value.toString())));
  }


  onCancel() {
    this.dialogRef.close();
  }

}
