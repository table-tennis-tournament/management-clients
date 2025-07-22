import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {Player} from '../../match/player.model';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-dialog.component.html',
  styleUrls: ['./player-dialog.component.scss']
})
export class PlayerDialogComponent implements OnInit {
  public playersFormGroup: any;

  constructor(
    public dialogRef: MatDialogRef<PlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public players: Player[],
    private formBuilder: UntypedFormBuilder) {
  }

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
