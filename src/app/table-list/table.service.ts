import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Table} from './tt-table/table.model';

@Injectable({
    providedIn: 'root'
})
export class TableService {

    constructor(private http: HttpClient) {
    }

    getTables(managerId: number): Observable<Table[]> {
        return this.http.get<Table[]>(`/api/tables?table_manager=${managerId}`);
    }

    startGame() {

    }

    finishGame() {

    }
}
