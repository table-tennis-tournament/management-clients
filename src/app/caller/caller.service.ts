import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Player} from '../shared/data/player.model';
import {HttpClient} from '@angular/common/http';
import {StatusDto} from '../shared/statusdto.model';
import {MatchAggregate} from '../shared/data/match.aggregate';

@Injectable({
    providedIn: 'root'
})
export class CallerService {

    constructor(private http: HttpClient) {
    }

    loadAvailableReferees(): Observable<Player[]> {
        return Observable.create([]);
    }

    callMatch(matchIds: number[]): Observable<StatusDto> {
        return this.http.post<StatusDto>('/api/match/call', matchIds);
    }

    loadMatchAggregateForCaller(): Observable<MatchAggregate[]> {
        return this.http.get<MatchAggregate[]>('/api/matchaggregate/caller');
    }
}
