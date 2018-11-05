import {Injectable} from '@angular/core';
import {StatusDto} from '../shared/statusdto.model';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MatchService {

    private freeMatchUrl = 'api/match/free';
    private takeBackMatchUrl = 'api/match/takeBack';

    constructor(private http: HttpClient) {
    }

    freeMatches(matchIds: number[]): Observable<StatusDto> {
        return this.http.post<StatusDto>(this.freeMatchUrl, matchIds);
    }

    takeBackMatches(matchIds: number[]): Observable<StatusDto> {
        return this.http.post<StatusDto>(this.takeBackMatchUrl, matchIds);
    }

    assignToSecondTable(tableNr: number, matchIds: number[]) {
        return this.http.post(`api/match/matchtosecondtable/${tableNr}`, matchIds);
    }
}
