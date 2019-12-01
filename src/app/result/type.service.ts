import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Type} from './data/type';

@Injectable({
  providedIn: 'root'
})
export class TypeService {

  constructor(private http: HttpClient) {
  }

  getOpenTypes(): Observable<Type[]> {
    return this.http.get<Type[]>(`/api/types/open/all`);
  }
}
