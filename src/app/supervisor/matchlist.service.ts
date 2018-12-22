import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MatchList} from './matchlist.model';
import {StatusDto} from '../shared/statusdto.model';
import {MatchListItem} from './matchlistitem.model';

@Injectable({
    providedIn: 'root'
})
export class MatchListService {


    constructor(private http: HttpClient) {
    }


    loadAllMatchListItems(): Observable<MatchList[]> {
        return this.http.get<MatchList[]>(`api/matchlist/all`);
    }

    assignToMatchList(matches: MatchListItem):Observable<StatusDto> {
        return this.http.post<StatusDto>(`api/matchlist/addMatch`, matches);
    }

    deleteMatchListItem(matchId: any): Observable<StatusDto>{
        return this.http.delete(`api/matchlist/deleteMatch/${matchId}`);
    }

    moveMatchListItem(matchListItem: MatchListItem):Observable<StatusDto> {
        return this.http.get(`api/matchlist/move/${matchListItem.id}/${matchListItem.position}`);
    }

}
