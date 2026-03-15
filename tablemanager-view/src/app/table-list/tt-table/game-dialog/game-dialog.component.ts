import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import {GameData} from './gamedata.model';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatDivider } from '@angular/material/list';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { PlayerNamePipe } from '../../player-name.pipe';
import { ClubNamePipe } from '../../club-name.pipe';

@Component({
    selector: 'app-game-dialog',
    templateUrl: './game-dialog.component.html',
    styleUrls: ['./game-dialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDivider, MatFormField, FormsModule, MatInput, MatDialogActions, MatButton, PlayerNamePipe, ClubNamePipe]
})
export class GameDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<GameDialogComponent>>(MatDialogRef);
  gameData = inject<GameData>(MAT_DIALOG_DATA);

  public resultString: string;

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
