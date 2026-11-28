import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { Observable, filter } from 'rxjs';
import { PlayerNamePipe } from '../../player-name.pipe';
import { Match } from '../../match/match.model';
import { Player } from '../../match/player.model';
import { callNumber } from '../../../shared/match-state/match-state';

/** The Third call is a player's last. */
export const LAST_CALL_NUMBER = 3;

/** The players of both Sides of [match]. */
export function playersOf(match: Match): Player[] {
  return [...match.players_a, ...match.players_b];
}

/** Whether [player] can still be called again: the Third call is the last. */
export function canBeCalledAgain(player: Player): boolean {
  return (player.call_count ?? 0) < LAST_CALL_NUMBER;
}

/**
 * Whether the table manager can request a Second or Third call for [match] now: its first Call is announced, no
 * requested call waits for the caller and a player can still be called again.
 */
export function canRequestCall(match: Match): boolean {
  return callNumber(match) >= 1 && !match.requestedCallNumber && playersOf(match).some(canBeCalledAgain);
}

/** Asks which players of [match] have not appeared; emits their ids once, nothing on cancel. */
export function choosePlayersToCall(dialog: MatDialog, match: Match): Observable<number[]> {
  return dialog
    .open(PlayerDialogComponent, { width: '400px', data: playersOf(match) })
    .afterClosed()
    .pipe(filter((playerIds: number[] | undefined): playerIds is number[] => !!playerIds?.length));
}

/**
 * Requests the next call of the players who have not appeared. The table manager ticks them; a player after
 * the Third call cannot be ticked. Closes with the ticked player ids, or with nothing on cancel.
 */
@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-dialog.component.html',
  styleUrls: ['./player-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatCheckbox, PlayerNamePipe],
})
export class PlayerDialogComponent {
  dialogRef = inject<MatDialogRef<PlayerDialogComponent>>(MatDialogRef);
  players = inject<Player[]>(MAT_DIALOG_DATA);

  missing = new Set<number>();

  canBeCalledAgain = canBeCalledAgain;

  toggle(player: Player, checked: boolean) {
    if (player.player_id == null) {
      return;
    }
    if (checked) {
      this.missing.add(player.player_id);
    } else {
      this.missing.delete(player.player_id);
    }
  }

  onOk() {
    this.dialogRef.close([...this.missing]);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
