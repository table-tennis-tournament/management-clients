import {EventEmitter, Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {environment} from '../../environments/environment';
import {DOCUMENT} from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    connected$ = new BehaviorSubject<any>({});
    disconnected$: EventEmitter<any> = new EventEmitter<any>();

    private socket$: WebSocketSubject<any>;

    constructor(@Inject(DOCUMENT) private document) {
    }

    public connectSocket(): Observable<any> {
        const myLocation = this.document.location.hostname;
        const url = `${environment.socket.protocol}://${myLocation}${environment.socket.port}${environment.socket.baseUrl}`;
        console.log('connect to: ' + url);
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
                    this.connected$.next(event);
                },
                (err) => {
                    console.log('websocket error event');
                    console.log(err);
                    this.socket$.unsubscribe();
                    this.connected$.complete();
                    this.connected$ = new BehaviorSubject<any>({});
                    this.disconnected$.next(err);
                    this.disconnected$.complete();
                    this.disconnected$ = new EventEmitter();
                },
                () => {
                    console.warn('websocket completed');
                    console.log('try to reconnect ...');
                }
            );
            }
        );
    }

    registerListeners(listeners: any) {
        this.connected$.subscribe(listeners.connected);
        this.disconnected$.subscribe(listeners.disconnected);
    }
}
