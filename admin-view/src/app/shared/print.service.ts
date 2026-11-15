import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatusDto } from './statusdto.model';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private http = inject(HttpClient);

  public printMatch(matchId: number): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/printer/print/${matchId}`, null);
  }
}
