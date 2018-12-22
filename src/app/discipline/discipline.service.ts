import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Discipline} from './discipline.model';

@Injectable({
  providedIn: 'root'
})
export class DisciplineService {

  constructor(private http: HttpClient) { }

    loadOpenDisciplines(): Observable<Discipline[]> {
        return this.http.get<Discipline[]>(`api/types/open/all`);
    }

    loadAllDisciplines(): Observable<Discipline[]> {
        return this.http.get<Discipline[]>(`api/types/all`);
    }
}
