import {Injectable} from '@angular/core';
import {TableDto} from './tabledto.model';
import {Observable} from 'rxjs/internal/Observable';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class TableService {

  private allTablesUrl = "/api/table/all";

  constructor(private http: HttpClient){}

  getAllTables(): Observable<TableDto[]>{
    return this.http.get<TableDto[]>(this.allTablesUrl);
  }
}
