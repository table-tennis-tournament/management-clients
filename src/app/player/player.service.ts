import {Injectable} from '@angular/core';
import {Player} from './player.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

  constructor(private http: HttpClient) {
    }

    getAllPlayers() {
      return this.http.get<Player[]>('/api/players/all');
    }
}
