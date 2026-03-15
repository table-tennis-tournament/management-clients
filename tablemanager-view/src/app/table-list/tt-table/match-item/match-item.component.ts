import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Match} from '../../match/match.model';
import {PlayerDialogComponent} from '../player-dialog/player-dialog.component';
import { MatBadge } from '@angular/material/badge';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PlayerNamePipe } from '../../player-name.pipe';

@Component({
    selector: 'app-match-item',
    templateUrl: './match-item.component.html',
    styleUrls: ['./match-item.component.scss'],
    imports: [MatBadge, MatMiniFabButton, MatIcon, PlayerNamePipe]
})
export class MatchItemComponent {
  dialog = inject(MatDialog);


  @Input()
  match: Match;

  @Output()
  startMatch = new EventEmitter();

  @Output()
  callPlayersForMatch = new EventEmitter();


  callPlayers() {
    const dialogRef = this.dialog.open(PlayerDialogComponent, {
      width: '400px',
      data: this.match.players_a.concat(this.match.players_b)
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.callPlayersForMatch.emit({
          playerIds: result,
          matchId: this.match.match_id
        });
      }
    });
  }
}
