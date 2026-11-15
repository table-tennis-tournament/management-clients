import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { StatusDto } from '../shared/statusdto.model';
import { TableDto } from './tabledto.model';

@Injectable()
export class TableService {
  private http = inject(HttpClient);

  private allTablesUrl = '/api/v2/table/all';

  getAllTables(): Observable<TableDto[]> {
    return this.http.get<TableDto[]>(this.allTablesUrl);
  }

  lockTable(tableNr: number): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/table/${tableNr}/lock`, null);
  }

  unLockTable(tableNr: number): Observable<StatusDto> {
    return this.http.post<StatusDto>(`/api/v2/table/${tableNr}/unlock`, null);
  }

  getFreeTables(): Observable<TableDto[]> {
    return this.http.get<TableDto[]>('/api/v2/table/free');
  }
}
