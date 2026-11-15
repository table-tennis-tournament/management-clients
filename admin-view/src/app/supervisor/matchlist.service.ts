import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatchList } from './matchlist.model';
import { StatusDto } from '../shared/statusdto.model';
import { MatchListItem } from './matchlistitem.model';
import { MatchListEntry } from './matchlist-entry.model';

@Injectable({
  providedIn: 'root',
})
export class MatchListService {
  private http = inject(HttpClient);

  /**
   * Loads the queue. The v2 backend only delivers the match ids of each entry; the matches
   * themselves are joined from the matches state (see `getMatchListState`).
   */
  loadAllMatchListItems(): Observable<MatchList[]> {
    return this.http
      .get<MatchListEntry[]>(`/api/v2/matchlist/all`)
      .pipe(map((entries) => entries.map((entry) => this.toMatchList(entry))));
  }

  private toMatchList(entry: MatchListEntry): MatchList {
    return {
      matchListItem: {
        id: entry.uuid,
        matchIds: entry.matchIds,
        position: entry.position,
        group: entry.asGroup,
      },
      matchinfo: [],
    };
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
