import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadTables } from '../table/redux/table.actions';
import { LoadMatches } from '../assign/redux/match.actions';
import { LoadMatchList } from '../supervisor/redux/matchlist.actions';
import { LoadCallerMatches, LoadSecondCallMatches, LoadThirdCallMatches } from '../caller/redux/caller.actions';
import { LoadDiscipline } from '../discipline/redux/discipline.actions';
import { LoadResults } from '../result/redux/result.actions';
import { ConnectWebSocket } from './redux/websocket.actions';
import { WebsocketMessage } from '../shared/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketHandlerService {
  constructor(private store: Store<any>) {}

  public connectToWebsocket() {
    console.log('start connecting to socket');
    this.store.dispatch(
      new ConnectWebSocket({
        connected: this.handleWebsocketMessage.bind(this),
        disconnected: this.handleDisconnect.bind(this),
      })
    );
  }

  private handleDisconnect(event: any) {
    console.log('websocket disconnected', event);
  }

  private handleWebsocketMessage(message: WebsocketMessage) {
    console.log('handle websocket message: ');
    console.log(message);
    switch (message.type) {
      case 'MATCH_ASSIGNED':
      case 'MATCH_STARTED':
      case 'MATCH_FREED':
      case 'MATCH_TAKEN_BACK':
        this.store.dispatch(new LoadMatches(null));
        this.store.dispatch(new LoadTables(null));
        this.store.dispatch(new LoadCallerMatches());
        this.store.dispatch(new LoadResults(null));
        break;
      case 'MATCH_RESULT_UPDATED':
      case 'MATCH_COMPLETED':
        this.store.dispatch(new LoadMatches(null));
        this.store.dispatch(new LoadTables(null));
        this.store.dispatch(new LoadCallerMatches());
        this.store.dispatch(new LoadResults(null));
        this.store.dispatch(new LoadSecondCallMatches());
        this.store.dispatch(new LoadThirdCallMatches());
        break;
      case 'MATCH_CALLED':
        this.store.dispatch(new LoadCallerMatches());
        this.store.dispatch(new LoadSecondCallMatches());
        this.store.dispatch(new LoadThirdCallMatches());
        break;
      case 'MATCH_LIST_CHANGED':
        this.store.dispatch(new LoadMatchList(null));
        break;
      case 'PLAYER_REGISTERED':
      case 'PLAYER_UNREGISTERED':
        this.store.dispatch(new LoadDiscipline(null));
        break;
      default:
        console.warn('unknown websocket message type', message.type);
    }
  }
}
