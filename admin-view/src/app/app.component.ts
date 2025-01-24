import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadTables } from './table/redux/table.actions';
import { LoadMatches } from './assign/redux/match.actions';
import { LoadMatchList } from './supervisor/redux/matchlist.actions';
import { LoadDiscipline } from './discipline/redux/discipline.actions';
import { WebsocketHandlerService } from './websocket/websocket.handler.service';

@Component({
    selector: 'toma-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit {
  constructor(private store: Store<any>, private websocketService: WebsocketHandlerService) {}

  ngOnInit(): void {
    this.websocketService.connectToWebsocket();
    this.store.dispatch(new LoadDiscipline(null));
    this.store.dispatch(new LoadMatches(null));
    this.store.dispatch(new LoadTables(null));
    this.store.dispatch(new LoadMatchList(null));
  }
}
