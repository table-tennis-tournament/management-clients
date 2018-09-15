import {Injectable} from '@angular/core';
import {StatusDto} from '../shared/statusdto.model';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MatchService {

    private freeMatchUrl = 'api/match/free';

    constructor(private http: HttpClient) {
    }

    freeMatches(matchIds: number[]): Observable<StatusDto> {
        return this.http.post<StatusDto>(this.freeMatchUrl, matchIds);
    }
}
