import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MatchList} from './matchlist.model';

@Injectable({
    providedIn: 'root'
})
export class MatchListService {


    constructor(private http: HttpClient) {
    }


    loadAllMatchListItems(): Observable<MatchList[]> {
        return this.http.get<MatchList[]>(`api/matchlist/all`);
    }

}
