import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Table } from '../table-list/table.model';
import { Match } from '../table-list/match.model';
import { Player } from '../table-list/player.model';
import { Classification } from '../table-list/classification.model';
import { Club } from '../table-list/club.model';

@Injectable({
    providedIn: 'root'
})
export class TableService {

    constructor(private http: HttpClient) {
    }

    getTables(): Observable<Table[]> {
        return of([
            {
                id: 4711,
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
                        name: 'beginners',
                        classificationId: 1
                    } as Classification
                } as Match
            } as Table
        ]);
    }

    startGame() {

    }

    finishGame() {

    }
}
