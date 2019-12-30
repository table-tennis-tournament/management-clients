import {Injectable} from '@angular/core';
import {Player} from './data/player.model';
import {HttpClient} from '@angular/common/http';
import {PlayerType} from './data/player.type.model';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    constructor(private http: HttpClient) {
    }

    getAllPlayers() {
        return this.http.get<Player[]>('/api/players/all');
    }

    getAllPlayerTypes() {
        return this.http.get<PlayerType[]>('/api/players/allTypePerPlayer');
    }

    setPlayerPaid(playerType: PlayerType) {
        const paid = playerType.paid ? 1 : 0;
        return this.http.get<PlayerType[]>(`/api/players/setPayed/${playerType.id}/${paid}`);
    }
}
