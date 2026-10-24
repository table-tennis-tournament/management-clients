import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from '../shared/data/player.model';
import { HttpClient } from '@angular/common/http';
import { StatusDto } from '../shared/statusdto.model';
import { MatchAggregate } from '../shared/data/match.aggregate';

@Injectable({
  providedIn: 'root',
})
export class CallerService {
  constructor(private http: HttpClient) {}

  loadAvailableReferees(): Observable<Player[]> {
    return Observable.create([]);
  }

  loadMatchAggregateForCaller(): Observable<MatchAggregate[]> {
    return this.http.get<MatchAggregate[]>('/api/v2/matchaggregates/caller');
  }

  loadSecondCallMatches(): Observable<MatchAggregate[]> {
    return this.http.get<MatchAggregate[]>('/api/v2/matchaggregates/secondCall');
  }

  loadThirdCallMatches(): Observable<MatchAggregate[]> {
    return this.http.get<MatchAggregate[]>('/api/v2/matchaggregates/thirdCall');
  }

  callMatch(matchIds: number[]): Observable<StatusDto> {
    return this.http.post<StatusDto>('/api/v2/match/call', matchIds);
  }
}
