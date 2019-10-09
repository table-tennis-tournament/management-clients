import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Game} from './game.model';

@Injectable({providedIn: 'root'})
export class MatchService {

    constructor(private http: HttpClient) {
    }

    updateMatchResult(matchId: number, game: Game): Observable<any> {
        return this.http.post<any>(`api/matches/${matchId}/games`, game);
    }
}
