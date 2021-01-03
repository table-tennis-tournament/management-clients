import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Match} from '../../match/match.model';
import {PlayerDialogComponent} from '../player-dialog/player-dialog.component';

@Component({
  selector: 'app-match-item',
  templateUrl: './match-item.component.html',
  styleUrls: ['./match-item.component.scss']
})
export class MatchItemComponent {

  @Input()
  match: Match;

  @Output()
  startMatch = new EventEmitter();

  @Output()
  callPlayersForMatch = new EventEmitter();

  constructor(public dialog: MatDialog) { }


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

  isSecondCall() {
    return this.match.state === 'SecondCall';
  }

  isThirdCall() {
    return this.match.state === 'ThirdCall';
  }
}
