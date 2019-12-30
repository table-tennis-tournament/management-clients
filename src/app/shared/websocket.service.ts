import {EventEmitter, Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import * as SockJS from 'sockjs-client';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    private websocket: any;

    constructor(@Inject(DOCUMENT) private document) {
    }

    public connectTable(listeners: any): Observable<any> {
        return this.connectSocks(listeners);
    }

    private connectSocks(listeners: any) {
        const connectListener = new EventEmitter<any>();
        const disconnectListener = new EventEmitter<any>();
        connectListener.subscribe(listeners.connected);
        disconnectListener.subscribe(listeners.disconnected);

        return Observable.create(complete => {
            this.websocket = new SockJS('/api/websocket');
            this.websocket.onopen = function (e) {
                complete.next();
            };
            this.websocket.onmessage = function (e) {
                const jsonMessage = JSON.parse(e.data);
                connectListener.emit(jsonMessage);
            };
            this.websocket.onclose = function (e) {
                console.log('websocket error event');
                console.log(e);
                connectListener.complete();
                disconnectListener.emit(e);
            };
        });
    }
}
