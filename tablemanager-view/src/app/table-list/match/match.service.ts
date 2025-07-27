import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Result} from './result.model';

@Injectable({providedIn: 'root'})
export class MatchService {

  constructor(private http: HttpClient) {
  }

  // updateMatchResult(matchId: number, result: Result): Observable<any> {
  //   return this.http.put<any>(`api/matches/${matchId}/result`, result);
  // }

  updateMatchResult(matchId: number, result: Result): Observable<any> {
    const results = result.games.map(game => [game.score_player_a, game.score_player_b]);
    return this.http.post<any>(`api/match/${matchId}/updateResult`, results);
  }

  // finishMatch(matchId: number) {
  //   return this.http.put<any>(`api/matches/${matchId}/state`, {state: 'FINISHED'});
  // }

  finishMatch(matchId: number, result: Result) {
    const results = result.games.map(game => [game.score_player_a, game.score_player_b]);
    return this.http.post<any>(`api/match/${matchId}/setResult`, results);
  }

  startMatch(tableId: number, matchId: number): Observable<any> {
    return this.http.get<any>(`api/match/start/${matchId}/${tableId}`);
  }

  callPlayersForMatch(playerIds: number[], matchId: number) {
    return this.http.post<any>(`api/playercall/${matchId}`, {player_ids: playerIds});
  }

  takeBackMatch(matchId: number) {
    return this.http.get<any>(`api/match/stop/${matchId}`);
  }
}
