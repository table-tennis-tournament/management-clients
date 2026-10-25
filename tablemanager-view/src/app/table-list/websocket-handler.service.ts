import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { WebsocketService } from '../services/websocket.service';
import { loadTables } from './redux/table-list.actions';
import { getTableManagerId } from './redux/table-list.reducer';

@Injectable({
  providedIn: 'root',
})
export class WebsocketHandlerService {
  private store = inject<Store<any>>(Store);
  private websocketService = inject(WebsocketService);

  public connectToWebsocket() {
    console.log('start connecting to socket');
    this.websocketService
      .connect({
        connected: this.handleWebsocketMessage.bind(this),
        disconnected: this.handleDisconnect.bind(this),
      })
      .subscribe();
  }

  private handleDisconnect(event: any) {
    console.log('websocket disconnected', event);
  }

  private handleWebsocketMessage(message: { type: string; payload: any }) {
    console.log('handle websocket message: ');
    console.log(message);
    switch (message.type) {
      case 'MATCH_ASSIGNED':
      case 'MATCH_STARTED':
      case 'MATCH_RESULT_UPDATED':
      case 'MATCH_COMPLETED':
      case 'MATCH_FREED':
      case 'MATCH_TAKEN_BACK':
      case 'MATCH_CALLED':
        this.reloadTables();
        break;
      default:
        console.warn('unknown websocket message type', message.type);
    }
  }

  private reloadTables() {
    this.store
      .select(getTableManagerId)
      .pipe(take(1))
      .subscribe((tableManagerId) => {
        if (tableManagerId != null) {
          this.store.dispatch(loadTables({ tableManagerId }));
        }
      });
  }
}
