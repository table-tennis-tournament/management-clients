import {Injectable} from '@angular/core';
import {TableDto} from '../table/tabledto.model';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    constructor() {
    }

    getAllPlayers() {
        return this.http.get<TableDto[]>('api/player/all');
    }
}
