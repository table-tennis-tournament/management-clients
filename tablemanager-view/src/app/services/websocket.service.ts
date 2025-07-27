import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as SockJS from 'sockjs-client';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    websocket: any;

    connectSocks(listeners: any): Observable<any> {
        const connectListener = new EventEmitter<any>();
        connectListener.subscribe(listeners.connected);
        const disconnectListener = new EventEmitter<any>();
        disconnectListener.subscribe(listeners.disconnected);

        return new Observable(complete => {
            this.websocket = new SockJS('/api/websocket');
            this.websocket.onopen = () => complete.next();
            this.websocket.onmessage = (e) => {
                const jsonMessage = JSON.parse(e.data);
                connectListener.emit(jsonMessage);
            };
            this.websocket.onclose = (e) => {
                console.log('websocket error event');
                console.log(e);
                connectListener.complete();
                disconnectListener.emit(e);
            };
        });
    }
}
