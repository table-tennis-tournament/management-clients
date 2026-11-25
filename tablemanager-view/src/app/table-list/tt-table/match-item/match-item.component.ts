import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Match } from '../../match/match.model';
import { canRequestCall, choosePlayersToCall } from '../player-dialog/player-dialog.component';
import { Player } from '../../match/player.model';
import { MinuteClock } from '../../../shared/clock/minute-clock.service';
import { minutesSinceFirstCall } from '../../../shared/match-state/match-state';
import { MatBadge } from '@angular/material/badge';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PlayerNamePipe } from '../../player-name.pipe';

@Component({
  selector: 'app-match-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './match-item.component.html',
  styleUrls: ['./match-item.component.scss'],
  imports: [MatBadge, MatMiniFabButton, MatIcon, PlayerNamePipe],
})
export class MatchItemComponent {
  dialog = inject(MatDialog);
  private clock = inject(MinuteClock);

  @Input({ required: true })
  match!: Match;

  @Output()
  startMatch = new EventEmitter();

  @Output()
  callPlayersForMatch = new EventEmitter();

  /** The highest call of a Side's players, for its badge from the Second call on. */
  highestCall(side: Player[] | undefined): number {
    return Math.max(0, ...(side ?? []).map((player) => player.call_count ?? 0));
  }

  canCall(): boolean {
    return canRequestCall(this.match);
  }

  waitingMinutes(): number | null {
    return minutesSinceFirstCall(this.match, this.clock.now());
  }

  /** Asks who is missing and requests their next call. */
  callPlayers() {
    choosePlayersToCall(this.dialog, this.match).subscribe((playerIds) =>
      this.callPlayersForMatch.emit({ matchId: this.match.match_id, playerIds })
    );
  }
}
