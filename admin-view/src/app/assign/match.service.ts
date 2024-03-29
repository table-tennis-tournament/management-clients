import { Injectable } from '@angular/core';
import { StatusDto } from '../shared/statusdto.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TTMatchResult } from '../table/table-list/result-modal/ttmatch-result.model';
import { Match } from '../shared/data/match.model';
import { MatchToTable } from '../table/table-list/tt-table/tt-table-content/matchtotable.model';
import { TableMatchEvent } from '../table/redux/table.match.event';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private freeMatchUrl = 'api/match/free';
  private takeBackMatchUrl = 'api/match/takeBack';

  constructor(private http: HttpClient) {}

  freeMatches(matchIds: number[]): Observable<StatusDto> {
    return this.http.post<StatusDto>(this.freeMatchUrl, matchIds);
  }

  takeBackMatches(matchIds: number[]): Observable<StatusDto> {
    return this.http.post<StatusDto>(this.takeBackMatchUrl, matchIds);
  }

  assignToSecondTable(tableNr: number, matchIds: number[]): Observable<StatusDto> {
    return this.http.post<StatusDto>(`api/match/matchtosecondtable/${tableNr}`, matchIds);
  }

  resultForMatch(matchResult: TTMatchResult): Observable<StatusDto> {
    return this.http.post<StatusDto>(`api/match/${matchResult.match.id}/setResult`, matchResult.result);
  }

  loadAllMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`api/match/all`);
  }

  assignMatchToTable(matchToTable: MatchToTable): Observable<StatusDto> {
    return this.http.post<StatusDto>(`api/match/matchtotable/${matchToTable.tableNr}`, matchToTable.matchIds);
  }

  reloadMatchesFromDb(): Observable<StatusDto> {
    return this.http.get<StatusDto>(`/api/match/loadnew`);
  }

  loadPlayedMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`/api/match/played/all`);
  }

  removeMatchFromTable(payload: TableMatchEvent): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/match/remove/${payload.tableId}`, payload.matchIds);
  }
}
