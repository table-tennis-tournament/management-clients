import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Result} from './result.model';

@Injectable({providedIn: 'root'})
export class MatchService {

  constructor(private http: HttpClient) {
  }

  updateMatchResult(matchId: number, result: Result): Observable<any> {
    return this.http.put<any>(`api/matches/${matchId}/result`, result);
  }

  finishMatch(matchId: number) {
    return this.http.put<any>(`api/matches/${matchId}/state`, {state: 'FINISHED'});
  }

  startMatch(tableId: number, matchId: number) {
    return this.http.put<any>(`api/matches/${matchId}/state`, {state: 'STARTED'});
  }

  callPlayersForMatch(playerIds: number[], matchId: number) {
    return this.http.post<any>(`api/playercall/${matchId}`, {player_ids: playerIds});
  }

  takeBackMatch(matchId: number) {
    return this.http.put<any>(`api/matches/${matchId}/state`, {state: 'ASSIGNED'});
  }
}
