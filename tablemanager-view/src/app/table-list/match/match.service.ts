import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from './result.model';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private http = inject(HttpClient);

  updateMatchResult(matchId: number, result: Result): Observable<any> {
    const results = result.games.map((game) => [game.score_player_a, game.score_player_b]);
    return this.http.post<any>(`/api/v2/match/updateResult/${matchId}`, results);
  }

  finishMatch(matchId: number, result: Result) {
    const results = result.games.map((game) => [game.score_player_a, game.score_player_b]);
    return this.http.post<any>(`/api/v2/match/setResult/${matchId}`, results);
  }

  startMatch(tableId: number, matchId: number): Observable<any> {
    return this.http.post<any>(`/api/v2/match/start/${matchId}/${tableId}`, null);
  }

  callPlayersForMatch(playerIds: number[], matchId: number) {
    return this.http.post<any>(`/api/v2/playercall/${matchId}`, null);
  }

  takeBackMatch(matchId: number) {
    return this.http.post<any>(`/api/v2/match/stop/${matchId}`, null);
  }
}
