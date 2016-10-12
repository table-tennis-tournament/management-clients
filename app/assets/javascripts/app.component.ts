import {Component, OnInit} from 'angular2/core';
import {Player} from './data/Player';
import {PlayerDetailComponent} from './player-detail.component';
import {PlayerService} from './player.service';

@Component({
  selector: 'my-app',
  template:`
    <h1>{{title}}</h1>
    <h2>My Players</h2>
    <ul class="heroes">
      <li *ngFor="#player of players"
        [class.selected]="player === selectedPlayer"
        (click)="onSelect(player)">
        <span class="badge">{{player.id}}</span> {{player.firstName}} {{player.lastName}}
      </li>
    </ul>
    <my-player-detail [player]="selectedPlayer"></my-player-detail>
  `,
  directives: [PlayerDetailComponent],
  providers: [PlayerService]
})
export class AppComponent implements OnInit {
  public title = 'TurnierManager';
  public players: Player[];
  public selectedPlayer: Player;

  constructor(private _playerService: PlayerService) { }

  getPlayers() {
    var result = this._playerService.getHeroes();
    this.players = result;
  }

  ngOnInit() {
    this.getPlayers();
  }

  onSelect(player: Player) { this.selectedPlayer = player; }
}
