import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatusDto } from './statusdto.model';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  constructor(private http: HttpClient) {}

  public printMatch(matchId: number): Observable<StatusDto> {
    return this.http.get<StatusDto>(`api/printer/print/${matchId}`);
  }
}
