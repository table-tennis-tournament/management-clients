import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadTables } from './table/redux/table.actions';
import { LoadMatches } from './assign/redux/match.actions';
import { LoadMatchList } from './supervisor/redux/matchlist.actions';
import { LoadDiscipline } from './discipline/redux/discipline.actions';
import { WebsocketHandlerService } from './websocket/websocket.handler.service';
import { LoadTypeColors } from './settings/redux/settings.actions';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'toma-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  private store = inject<Store<any>>(Store);
  private websocketService = inject(WebsocketHandlerService);

  ngOnInit(): void {
    this.websocketService.connectToWebsocket();
    this.store.dispatch(new LoadTypeColors());
    this.store.dispatch(new LoadDiscipline(null));
    this.store.dispatch(new LoadMatches(null));
    this.store.dispatch(new LoadTables(null));
    this.store.dispatch(new LoadMatchList(null));
  }
}
