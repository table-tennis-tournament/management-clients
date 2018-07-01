import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {TableDto} from './tabledto.model';

@Injectable()
export class TableService {

    private allTablesUrl = '/api/table/all';

    constructor(private http: HttpClient) {
    }

    getAllTables(): Observable<TableDto[]> {
        return this.http.get<TableDto[]>(this.allTablesUrl);
    }
}
