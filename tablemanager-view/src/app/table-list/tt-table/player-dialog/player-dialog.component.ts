import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Player} from '../../match/player.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { PlayerNamePipe } from '../../player-name.pipe';

@Component({
    selector: 'app-player-dialog',
    templateUrl: './player-dialog.component.html',
    styleUrls: ['./player-dialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatCheckbox, MatDialogActions, MatButton, PlayerNamePipe]
})
export class PlayerDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<PlayerDialogComponent>>(MatDialogRef);
  players = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(UntypedFormBuilder);

  public playersFormGroup: any;

  ngOnInit() {
    this.playersFormGroup = this.formBuilder.group({
      players: this.formBuilder.array([])
    });
    const formArray = this.playersFormGroup.get('players') as UntypedFormArray;
    this.players.forEach(() => formArray.push(new UntypedFormControl(false)));
  }

  onOk() {
    const result = this.players
        .filter((x, i) => !!this.playersFormGroup.value.players[i]).map(player => player.player_id);
    this.dialogRef.close(result);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
