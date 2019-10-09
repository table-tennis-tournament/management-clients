import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import * as MatchActions from './match/redux/match.actions';
import * as TableActions from './redux/table-list.actions';
import {AppState, getTables} from './redux/table-list.reducer';
import {Table} from './tt-table/table.model';
import { WebsocketService } from '../services/websocket.service';

@Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.sass']
})
export class TableListComponent implements OnInit {

    tables$: Observable<Table[]>;

    eventmessages: any;

    constructor(private store: Store<AppState>, private events: WebsocketService) {
        this.tables$ = store.pipe(select(getTables));
    }

    ngOnInit() {
        this.store.dispatch(TableActions.loadTables({tableManagerId: 1}));
        this.events.activeTables.subscribe(tables => this.eventmessages = tables);
        this.events.initWebsocket();
    }

    onUpdateMatchResult($event: any) {
        this.store.dispatch(MatchActions.updateMatchResult({matchId: 100, game: {gameId: '100'}}));
    }
}
