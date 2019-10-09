import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Table } from '../table-list/tt-table/table.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  websocket: any;
  stompClient: any;
  backendUrl: string;

  connectedState = false;
  connected = new BehaviorSubject<boolean>(false);

  // this could be replaced by the redux-store implementation
  activeTables = new BehaviorSubject<Table[]>([]);

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

  protected handleWebsocketMessage(message: any): boolean {
    this.activeTables.next(message);
    const type = message.type;
    switch (type) {
    //     case 'DurchgangStarted':
    //       this._activeDurchgangList = [...this.activeDurchgangList, (message as DurchgangStarted)];
    //       this.durchgangStarted.next(this.activeDurchgangList);
    //       return true;

    //     case 'DurchgangFinished':
    //       const finished = (message as DurchgangFinished);
    //       this._activeDurchgangList = this.activeDurchgangList
    //         .filter(d => d.durchgang !== finished.durchgang || d.wettkampfUUID !== finished.wettkampfUUID);
    //       this.durchgangStarted.next(this.activeDurchgangList);
    //       return true;

    //     case 'AthletWertungUpdatedSequenced':
    //     case 'AthletWertungUpdated':
    //       const updated = (message as AthletWertungUpdated);
    //       this.wertungen = this.wertungen.map(w => {
    //         if (w.id === updated.wertung.athletId && w.wertung.wettkampfdisziplinId === updated.wertung.wettkampfdisziplinId ) {
    //           return Object.assign({}, w, {wertung: updated.wertung });
    //         } else {
    //           return w;
    //         }
    //       });
    //       this.wertungenSubject.next(this.wertungen);
    //       this.wertungUpdated.next(updated);
    //       return true;

    //     case 'AthletMovedInWettkampf':
    //     case 'AthletRemovedFromWettkampf':
    //       this.loadWertungen();
    //       return true;

    //     case 'NewLastResults':
    //       this.newLastResults.next((message as NewLastResults));
    //       return true;

    //     case 'MessageAck':
    //       console.log((message as MessageAck).msg);
    //       this.showMessage.next((message as MessageAck));
    //       return true;

      default:
        return false;
    }
  }

  public initWebsocket() {
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
          if (!this.handleWebsocketMessage(jsonMessage)) {
            console.log(jsonMessage);
            this.logMessages.next('unknown message: ' + evt.data);
          }
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
