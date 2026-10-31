import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatchList } from './matchlist.model';
import { StatusDto } from '../shared/statusdto.model';
import { MatchListItem } from './matchlistitem.model';

@Injectable({
  providedIn: 'root',
})
export class MatchListService {
  constructor(private http: HttpClient) {}

  loadAllMatchListItems(): Observable<MatchList[]> {
    return this.http.get<MatchList[]>(`/api/v2/matchlist/all`);
  }

  assignToMatchList(matches: MatchListItem): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/matchlist/add`, {
      matchIds: matches.matchIds,
      asGroup: matches.group,
      position: matches.position,
    });
  }

  deleteMatchListItem(matchId: any): Observable<StatusDto> {
    return this.http.delete<StatusDto>(`/api/v2/matchlist/${matchId}`);
  }

  moveMatchListItem(matchListItem: MatchListItem): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/matchlist/move/${matchListItem.id}/${matchListItem.position}`, null);
  }
}
