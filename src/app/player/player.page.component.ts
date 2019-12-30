import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Player} from './data/player.model';
import {Store} from '@ngrx/store';
import {LoadPlayers, SetPlayerPaid} from './redux/player.actions';
import {getPlayersLoading} from './redux/player.reducer';
import {getAllPlayersState} from './redux';
import {PlayerType} from './data/player.type.model';
import {getDisciplineState} from '../discipline/redux';
import {Discipline} from '../discipline/discipline.model';

@Component({
    selector: 'toma-player-page',
    templateUrl: './player.page.component.html',
    styleUrls: ['./player.page.component.scss']
})
export class PlayerPageComponent implements OnInit {

    players: Observable<PlayerType[]>;
    playersLoading: Observable<boolean>;
    disciplines: Observable<Discipline[]>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadPlayers(null));
        this.disciplines = this.store.select(getDisciplineState);
        this.players = this.store.select(getAllPlayersState);
        this.playersLoading = this.store.select(getPlayersLoading);
    }

    onPlayerChanged(playerType: PlayerType) {
        this.store.dispatch(new SetPlayerPaid(playerType));
    }
}
