import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

export interface WebsocketMessage {
  type: string;
  payload: any;
}

export interface WebsocketListeners {
  connected: (message: WebsocketMessage) => void;
  disconnected: (event: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client: Client;

  constructor() {}

  public connectTable(listeners: WebsocketListeners): Observable<void> {
    const connected = new Subject<void>();

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    this.client = new Client({
      brokerURL: `${protocol}${window.location.host}/ttt-websocket`,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.client.subscribe('/topic/updates', (message: IMessage) => {
          const parsed = JSON.parse(message.body) as WebsocketMessage;
          listeners.connected(parsed);
        });
        connected.next();
        connected.complete();
      },
      onStompError: (frame) => {
        console.error('stomp error', frame);
        listeners.disconnected(frame);
      },
      onWebSocketClose: (event) => {
        console.log('websocket closed', event);
        listeners.disconnected(event);
      },
    });

    this.client.activate();

    return connected.asObservable();
  }
}
