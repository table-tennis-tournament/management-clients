import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { auditTime, take } from 'rxjs/operators';
import { WebsocketMessage, WebsocketService } from '../services/websocket.service';
import { loadTables } from './redux/table-list.actions';
import { getTableManagerId, getTables } from './redux/table-list.reducer';
import { RELOAD_AUDIT_MS, relevanceOf, TABLEMANAGER_TOPICS } from './update-events';

@Injectable({
  providedIn: 'root',
})
export class WebsocketHandlerService {
  private store = inject<Store<any>>(Store);
  private websocketService = inject(WebsocketService);
  private reloads$ = new Subject<void>();

  constructor() {
    // a burst of events (for example a bulk call) results in one reload of the latest state
    this.reloads$.pipe(auditTime(RELOAD_AUDIT_MS)).subscribe(() => this.reloadTables());
  }

  public connectToWebsocket() {
    this.websocketService
      .connect({
        topics: TABLEMANAGER_TOPICS,
        message: this.handleWebsocketMessage.bind(this),
        connected: this.handleConnected.bind(this),
        disconnected: this.handleDisconnect.bind(this),
      })
      .subscribe();
  }

  private handleConnected(reconnect: boolean) {
    // the route loads the tables initially; after a reconnect events may have been missed
    if (reconnect) {
      this.reloads$.next();
    }
  }

  private handleDisconnect(event: any) {
    console.log('websocket disconnected', event);
  }

  private handleWebsocketMessage(message: WebsocketMessage) {
    this.store
      .select(getTables)
      .pipe(take(1))
      .subscribe((tables) => {
        switch (relevanceOf(message, tables)) {
          case 'reload':
            this.reloads$.next();
            break;
          case 'unknown':
            console.warn('unknown websocket message type', message.type);
            break;
        }
      });
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
