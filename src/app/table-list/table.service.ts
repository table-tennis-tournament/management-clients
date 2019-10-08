import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Table } from './table.model';
import { Match } from './match.model';
import { Player } from './player.model';
import { Classification } from './classification.model';
import { Club } from './club.model';

@Injectable({
    providedIn: 'root'
})
export class TableService {

    tableTemplate: Table = {
        id: 2,
        activeMatch: {
            matchId: 815,
            playerA: {
                id: 1,
                firstName: 'Hans',
                lastName: 'Muster',
                club: {
                    id: 1,
                    name: 'BTV Basel'
                } as Club
            } as Player,
            playerB: {
                id: 2,
                firstName: 'Gabi',
                lastName: 'Meier',
                club: {
                    id: 2,
                    name: 'TTT Mühlhausen'
                } as Club
            } as Player,
            classification: {
                name: 'BEGINNERS',
                classificationId: 1
            } as Classification
        } as Match
    } as Table;

    constructor(private http: HttpClient) {
    }

    getTables(): Observable<Table[]> {
        return of([
            Object.assign({}, this.tableTemplate, {id: 1}),
            Object.assign({}, this.tableTemplate)
        ]);
    }

    startGame() {

    }

    finishGame() {

    }
}
