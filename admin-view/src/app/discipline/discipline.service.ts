import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Discipline } from './discipline.model';

@Injectable({
  providedIn: 'root',
})
export class DisciplineService {
  private http = inject(HttpClient);

  loadAllDisciplines(): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(`/api/v2/types/all`);
  }
}
