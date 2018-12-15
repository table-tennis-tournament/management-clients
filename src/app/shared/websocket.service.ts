import {Injectable} from '@angular/core';
import {BehaviorSubject, observable, Observable} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {environment} from '../environments/environment';
import {PartialObserver} from 'rxjs/src/internal/types';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    // private SERVER_URL = 'ws://192.168.0.213:9000/register';
    // private socket: SocketIOClient.Socket;
    connected$ = new BehaviorSubject<any>({});
    private websocketObservable: Observable<object> = new Observable();
    private ws: WebSocket;

    private socket$: WebSocketSubject<any>;

    constructor() {
        // this.socket = socketio(environment.socket.baseUrl, environment.socket.config);
        // this.socket.on('connect', () => this.connected$.next(true));
        // this.socket.on('disconnect', () => this.connected$.next(false));
        this.socket$ = new WebSocketSubject(environment.socket.baseUrl);
        this.socket$.subscribe(
            (event) => this.connected$.next(event),
            (err) => console.log(err),
            () => {
                console.warn('websocket completed');
                console.log('try to reconnect ...');
            }
        );
        // this.connected$.subscribe(test => console.log(test));
    }

    public connectSocket(subscriber: any): Observable<string> {
        this.connected$.subscribe(subscriber);
        return new Observable();
        // return new Observable( observer => {
        //     observer.next(this.connected$);
        // });
        // return this.connected$;
        // return new Observable( observer => {
        //
        //     this.socket.on(event, data => {
        //
        //         console.group();
        //         console.log('----- SOCKET INBOUND -----');
        //         console.log('Action: ', event);
        //         console.log('Payload: ', data);
        //         console.groupEnd();
        //
        //         observer.next(data);
        //     });
        //     // dispose of the event listener when unsubscribed
        //     return () => this.socket.off(event);
        // });
    }

    disconnect() {
        // this.socket.disconnect();
        // this.connected$.next(false);
    }


    initializeWebSocket() {
        this.socket$ = new WebSocketSubject(environment.socket.baseUrl);
        this.socket$.subscribe(
            (event) => this.connected$.next(event),
            (err) => console.log(err),
            () => {
                console.warn('websocket completed');
                console.log('try to reconnect ...');
            }
        );
        this.socket$.next({data: {}});

        // this.websocketObservable = this.createObservable();
        // this.websocketObservable.subscribe(data => this.handleData(data), this.onError);
        // const subject = webSocket(this.SERVER_URL);
        // subject.subscribe(
        //     this.onMessageFromWebserviceGot.bind(this),
        //     (err) => console.log(err),
        //     () => console.log('websocket complete')
        // );
        // subject.next(JSON.stringify({}));
        // ) create(this.createObserver.bind(this, url));
        // this.websocketObservable.publish()(x => console.log(x));
    }

    // createObservable(): Observable<any> {
    //     this.ws = new WebSocket(this.SERVER_URL);
    //     return new Observable(observer => {
    //             this.ws.onmessage = (event) => observer.next(this.tryGetMessageFromWebsocket(event));
    //             this.ws.onerror = (event) => observer.error(event);
    //             this.ws.onclose = (event) => observer.complete();
    //             this.ws.onopen = () => console.log('websocket registered.');
    //         }
    //     );
    // }

    onWebsocketConnected() {
        console.log('WebSocket was successfully registered.');
    }


    tryGetMessageFromWebsocket(event) {
        try {
            return JSON.parse(event.data);
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    // private handleData(data: any) {
    //     if (data.UpdateTable && data.UpdateTable.length > 0) {
    //         const newTables: TableDto[] = data.UpdateTable;
    //         this.store.dispatch(new LoadTablesSuccess(newTables));
    //     }
    //     if (data.UpdateMatches && data.UpdateMatches.length > 0) {
    //         const newMatchData: Match[] = data.UpdateMatches;
    //         this.store.dispatch(new LoadMatchesSuccess(newMatchData));
    //     }
    //     if (data.UpdateMatchList && data.UpdateMatchList.length > 0) {
    //         const newMatchlistItems: MatchList[] = data.UpdateMatchList;
    //         this.store.dispatch(new LoadMatchListSuccess(newMatchlistItems));
    //     }
    // }

    private onError(data) {
        console.log('error');
        console.log(data);
    }
}
