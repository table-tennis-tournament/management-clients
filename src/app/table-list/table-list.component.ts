import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import * as MatchActions from './match/redux/match.actions';
import {Result} from './match/result.model';
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

    constructor(private store: Store<AppState>, private events: WebsocketService, private route: ActivatedRoute) {

        this.tables$ = store.pipe(select(getTables));
    }

    ngOnInit() {
        this.route.params
            .subscribe(
                params => this.store.dispatch(
                    TableActions.loadTables({tableManagerId: params.managerId})) );
        this.events.startListening();
    }

    onUpdateMatchResult(matchResult: any) {
        this.store.dispatch(MatchActions.updateMatchResult(matchResult));
    }
}
