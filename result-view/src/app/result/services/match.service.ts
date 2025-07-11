import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Match} from '../data/match';
import {Type} from '../data/type';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(private http: HttpClient) {
  }

  getMatchesByType(typeId: number): Observable<Match[]> {
    return this.http.get<Type[]>(`/api/match/typeid/${typeId}`);
  }
}
