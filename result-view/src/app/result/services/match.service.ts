import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Match } from '../data/match';
import { GroupStandings } from '../data/standing';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  constructor(private http: HttpClient) {}

  getMatchesByType(typeId: number): Observable<Match[]> {
    return this.http.get<Match[]>(`/api/v2/match/typeid/${typeId}`);
  }

  getStandings(typeId: number): Observable<GroupStandings[]> {
    return this.http.get<GroupStandings[]>(`/api/v2/groups/standings/${typeId}`);
  }
}
