import {EventEmitter, Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {environment} from '../../environments/environment';
import {DOCUMENT} from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {


    private socket$: WebSocketSubject<any>;

    constructor(@Inject(DOCUMENT) private document) {
    }

    public connectTable(listeners: any): Observable<any> {
        return this.connect(listeners);
    }

    private connect(listeners: any): Observable<any> {
        const myLocation = this.document.location.hostname;
        const url = `${environment.socket.protocol}://${myLocation}${environment.socket.port}${environment.socket.baseUrl}`;
        console.log('connecting to: ' + url);
        const connectListener = new BehaviorSubject<any>({});
        const disconnectListener = new EventEmitter<any>();
        connectListener.subscribe(listeners.connected);
        disconnectListener.subscribe(listeners.disconnected);
        return Observable.create(complete => {
                this.socket$ = new WebSocketSubject({
                    url: url,
                    openObserver: {
                        next: value => {
                            complete.next(value);
                        }
                    }
                });

                this.socket$.subscribe(
                    (event) => {
                        connectListener.next(event);
                    },
                    (err) => {
                        console.log('websocket error event');
                        console.log(err);
                        this.socket$.unsubscribe();
                        connectListener.complete();
                        disconnectListener.next(err);
                        disconnectListener.complete();
                    },
                    () => {
                        console.warn('websocket completed');
                        console.log('try to reconnect ...');
                    }
                );
            }
        );
    }
}
