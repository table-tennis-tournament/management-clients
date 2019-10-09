import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Game} from './game.model';
import {Result} from './result.model';

@Injectable({providedIn: 'root'})
export class MatchService {

    constructor(private http: HttpClient) {
    }

    updateMatchResult(matchId: number, game: Result): Observable<any> {
        return this.http.post<any>(`api/matches/${matchId}/games`, game);
    }
}
