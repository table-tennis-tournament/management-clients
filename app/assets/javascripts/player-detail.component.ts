import {Component} from '@angular/core';
import {Player} from './data/player';

@Component({
  selector: 'my-player-detail',
  template: `
    <div *ngIf="player">
      <h2>{{player.firstName}} details!</h2>
      <div><label>id: </label>{{player.id}}</div>
      <div>
        <label>name: </label>
        <input [(ngModel)]="player.firstName" placeholder="firstName"/>
      </div>
       <div>
        <label>lastName: </label>
        <input [(ngModel)]="player.lastName" placeholder="lastName"/>
      </div>
    </div>
  `,
  inputs: ['player']
})
export class PlayerDetailComponent{
  public player:Player;
}