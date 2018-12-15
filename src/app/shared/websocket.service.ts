import {Injectable} from '@angular/core';
import {BehaviorSubject, observable, Observable} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {environment} from '../environments/environment';
import {PartialObserver} from 'rxjs/src/internal/types';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    connected$ = new BehaviorSubject<any>({});
    disconnected$ = new BehaviorSubject<any>({});

    private socket$: WebSocketSubject<any>;

    constructor() {
    }

    public connectSocket(): Observable<any> {
        this.socket$ = new WebSocketSubject(environment.socket.baseUrl);
        return Observable.create(complete => {
            this.socket$.subscribe(
                (event) => {
                    this.connected$.next(event);
                    complete.next('open');
                },
                (err) => {
                    console.log('websocket error event');
                    console.log(err);
                    this.connected$.complete();
                    this.connected$ = new BehaviorSubject<any>({});
                    this.disconnected$.next(err);
                    this.disconnected$.complete();
                    this.disconnected$ = new BehaviorSubject<any>({});
                },
                () => {
                    console.warn('websocket completed');
                    console.log('try to reconnect ...');
                }
                );
            }
        );
        // const resolveConnectedObserver = Observable.create(observer => this.resolveFunction = observer);
        //
        // return resolveConnectedObserver;
    }

    registerListeners(listeners: any) {
        this.connected$.subscribe(listeners.connected);
        this.disconnected$.subscribe(listeners.disconnected);
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
