import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Table } from '../table-list/tt-table/table.model';
import { Store } from '@ngrx/store';
import { AppState } from '../table-list/redux/table-list.reducer';
import { matchAssignedToTable } from '../table-list/redux/table-list.actions';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private store: Store<AppState>) {

  }

  websocket: any;
  stompClient: any;
  backendUrl: string;

  connectedState = false;
  connected = new BehaviorSubject<boolean>(false);
  logMessages = new BehaviorSubject<string>('');
  lastMessages: string[] = [];

  sendMessage(message) {
    if (!this.websocket) {
      this.connect();
      this.stompClient.send('/topic/table', {}, JSON.stringify(message));
    } else if (this.connectedState) {
      this.stompClient.send('/topic/table', {}, JSON.stringify(message));
    }
  }

  disconnectWS() {
    this.close();
  }

  private close() {
    if (!!this.stompClient) {
      this.stompClient.disconnect();
    }
    this.connectedState = false;
    this.connected.next(this.connectedState);
  }

  protected getWebsocketBackendUrl(): string {
    return '/api/ttt-management-websocket';
  }

  public startListening() {
    this.logMessages.subscribe(msg => {
      this.lastMessages.push(msg);
      this.lastMessages = this.lastMessages.slice(Math.max(this.lastMessages.length - 50, 0));
    });
    this.logMessages.next('init');
    this.backendUrl = this.getWebsocketBackendUrl();
    this.logMessages.next('init with ' + this.backendUrl);

    this.connect();
  }

  private connect() {
    this.disconnectWS();

    this.websocket = new SockJS(this.backendUrl);
    this.stompClient = Stomp.over(this.websocket);
    this.stompClient.connect({}, frame => {
      this.connectedState = true;
      this.stompClient.subscribe('/topic/table', evt => {
        try {
          const jsonMessage = JSON.parse(evt.body);
          this.store.dispatch(matchAssignedToTable({table: jsonMessage as Table}));
        } catch (e) {
          this.logMessages.next(e + ': ' + evt.data);
        }
      });
      //this.stompClient.reconnect_delay = 2000;
    }, this.errorCallBack);
  }

  errorCallBack(error) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
        this.connect();
    }, 5000);
  }
}
