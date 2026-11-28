import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';

import { LoadPlayers, SetPlayerPaid } from './redux/player.actions';

import { getPlayersLoading } from './redux/player.reducer';

import { getAllPlayersState } from './redux';

import { PlayerType } from './data/player.type.model';

import { getDisciplineState } from '../discipline/redux';

import { Discipline } from '../discipline/discipline.model';

import { LoadDiscipline } from '../discipline/redux/discipline.actions';

import { PlayerListComponent } from './player-list/player-list.component';

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'toma-player-page',
  templateUrl: './player.page.component.html',
  styleUrls: ['./player.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PlayerListComponent, AsyncPipe],
})
export class PlayerPageComponent implements OnInit {
  private store = inject<Store<any>>(Store);

  players: Observable<PlayerType[]> = this.store.select(getAllPlayersState);
  playersLoading: Observable<boolean> = this.store.select(getPlayersLoading);
  disciplines: Observable<Discipline[]> = this.store.select(getDisciplineState);

  ngOnInit() {
    this.store.dispatch(new LoadPlayers(null));
    this.store.dispatch(new LoadDiscipline(null));
  }

  onPlayerChanged(playerType: PlayerType) {
    this.store.dispatch(new SetPlayerPaid(playerType));
  }
}
