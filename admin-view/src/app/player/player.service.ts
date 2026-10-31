import { Injectable } from '@angular/core';
import { Player } from './data/player.model';
import { HttpClient } from '@angular/common/http';
import { PlayerType } from './data/player.type.model';
import { StatusDto } from '../shared/statusdto.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private http: HttpClient) {}

  getAllPlayers() {
    return this.http.get<Player[]>('/api/v2/players/all');
  }

  getAllPlayerTypes() {
    return this.http.get<PlayerType[]>('/api/v2/players/allTypePerPlayer');
  }

  setPlayerPaid(playerType: PlayerType) {
    return this.http.post<StatusDto>(`/api/v2/players/${playerType.id}/paid?paid=${playerType.paid}`, null);
  }
}
