import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {StatusDto} from '../shared/statusdto.model';
import {TableDto} from './tabledto.model';

@Injectable()
export class TableService {

    private allTablesUrl = '/api/table/all';

    constructor(private http: HttpClient) {
    }

    getAllTables(): Observable<TableDto[]> {
        return this.http.get<TableDto[]>(this.allTablesUrl);
    }

    lockTable(tableNr: number): Observable<StatusDto> {
        return this.http.get<StatusDto>(`api/table/${tableNr}/lock`);
    }

    unLockTable(tableNr: number): Observable<StatusDto> {
        return this.http.get<StatusDto>(`api/table/${tableNr}/unlock`);
    }

    getFreeTables(): Observable<TableDto[]> {
        return this.http.get<TableDto[]>('api/table/free');
    }
}
