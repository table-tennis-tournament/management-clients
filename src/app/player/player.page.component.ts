import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Player} from './player.model';
import {Store} from '@ngrx/store';
import {LoadPlayers} from './redux/player.actions';
import {getPlayersLoading} from './redux/player.reducer';
import {getAllPlayersState} from './redux';

@Component({
    selector: 'toma-player-page',
    templateUrl: './player.page.component.html',
    styleUrls: ['./player.page.component.scss']
})
export class PlayerPageComponent implements OnInit {

    players: Observable<Player[]>;
    playersLoading: Observable<boolean>;

    constructor(private store: Store<any>) {
    }

    ngOnInit() {
        this.store.dispatch(new LoadPlayers(null));
        this.players = this.store.select(getAllPlayersState);
        this.playersLoading = this.store.select(getPlayersLoading);
        this.players.subscribe(this.onPlayersLoaded.bind(this));
    }

    onPlayersLoaded(event) {
        console.log('test');
        console.log(event);
    }

}
