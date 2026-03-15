import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {WebsocketService} from '../services/websocket.service';
import {Match} from './match/match.model';
import * as MatchActions from './match/redux/match.actions';
import * as TableActions from './redux/table-list.actions';
import {AppState, getTables} from './redux/table-list.reducer';
import {Table} from './tt-table/table.model';
import { TtTableComponent } from './tt-table/tt-table.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.scss'],
    imports: [TtTableComponent, AsyncPipe]
})
export class TableListComponent implements OnInit {
  private store = inject<Store<AppState>>(Store);
  private events = inject(WebsocketService);
  private route = inject(ActivatedRoute);


  tables$: Observable<Table[]>;
  subscription: Subscription;

  constructor() {
    const store = this.store;

    this.tables$ = store.pipe(select(getTables));
  }

  ngOnInit() {
    this.subscription = this.route
        .data
        .subscribe(v => this.store.dispatch(TableActions.loadTables({tableManagerId: v.tableManagerId})));
  }

  onUpdateMatchResult(matchResult: any) {
    this.store.dispatch(MatchActions.updateMatchResult(matchResult));
  }

  onFinishMatch(match: Match) {
    this.store.dispatch(MatchActions.finishMatch({matchId: match.match_id, result: match.result}));
  }

  onMatchOnTableStarted($event: any) {
    this.store.dispatch(MatchActions.startMatchOnTable($event));
  }

  onCallPlayersForMatch($event: any) {
    this.store.dispatch(MatchActions.callPlayerForMatch($event));
  }

  onTakeBackMatch($event: any) {
    this.store.dispatch(MatchActions.takeBackMatch($event));
  }
}
