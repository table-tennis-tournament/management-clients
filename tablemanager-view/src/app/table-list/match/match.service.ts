import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from './result.model';
import { toRequestBody } from '../../shared/result-entry/result-entry';
import { toSets } from './games';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private http = inject(HttpClient);

  updateMatchResult(matchId: number, result: Result): Observable<any> {
    return this.http.post<any>(`/api/v2/match/updateResult/${matchId}`, toRequestBody(toSets(result.games)));
  }

  finishMatch(matchId: number, result: Result) {
    return this.http.post<any>(`/api/v2/match/setResult/${matchId}`, toRequestBody(toSets(result.games)));
  }

  startMatch(tableId: number, matchId: number): Observable<any> {
    return this.http.post<any>(`/api/v2/match/start/${matchId}/${tableId}`, null);
  }

  /** Announces the next Call of the match; a Call always names all players of the match. */
  callPlayersForMatch(matchId: number) {
    return this.http.post<any>(`/api/v2/playercall/${matchId}`, null);
  }

  takeBackMatch(matchId: number) {
    return this.http.post<any>(`/api/v2/match/takeBack/${matchId}`, null);
  }
}
