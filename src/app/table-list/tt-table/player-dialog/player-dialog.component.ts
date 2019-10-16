import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Player} from '../../match/player.model';

@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-dialog.component.html',
  styleUrls: ['./player-dialog.component.scss']
})
export class PlayerDialogComponent implements OnInit {
  private playersFormGroup: any;

  constructor(
    public dialogRef: MatDialogRef<PlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public players: Player[],
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.playersFormGroup = this.formBuilder.group({
      players: this.formBuilder.array([])
    });
    const formArray = this.playersFormGroup.get('players') as FormArray;
    this.players.forEach(() => formArray.push(new FormControl(false)));
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
