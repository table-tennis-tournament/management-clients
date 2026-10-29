import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

/** The functional areas update events are published on (ADR 0003). */
export type UpdateTopic = 'matches' | 'tables' | 'queue' | 'players' | 'settings';

/** The part of the tournament an update event refers to. A missing list means "not restricted". */
export interface UpdateScope {
  matchIds?: number[];
  typeIds?: number[];
  tableIds?: number[];
}

export interface WebsocketMessage {
  type: string;
  scope?: UpdateScope;
  payload: any;
}

export interface WebsocketListeners {
  /** The topics this client renders. */
  topics: UpdateTopic[];
  /** Called for every update event. */
  message: (message: WebsocketMessage) => void;
  /** Called on every STOMP connect; `reconnect` is true for every connect after the first one. */
  connected: (reconnect: boolean) => void;
  disconnected: (event: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client: Client;

  connect(listeners: WebsocketListeners): Observable<void> {
    const connected = new Subject<void>();
    let connectCount = 0;

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    this.client = new Client({
      brokerURL: `${protocol}${window.location.host}/ttt-websocket`,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // subscriptions do not survive a reconnect, so they are created on every connect
        listeners.topics.forEach((topic) =>
          this.client.subscribe(`/topic/${topic}`, (message: IMessage) => {
            const parsed = this.parse(message);
            if (parsed) {
              listeners.message(parsed);
            }
          })
        );
        listeners.connected(connectCount > 0);
        connectCount++;
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

  private parse(message: IMessage): WebsocketMessage | null {
    try {
      return JSON.parse(message.body) as WebsocketMessage;
    } catch (e) {
      console.error('ignoring malformed websocket message', message.body, e);
      return null;
    }
  }
}
