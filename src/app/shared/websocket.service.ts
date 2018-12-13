import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {Match} from './data/match.model';
import {LoadMatchesSuccess} from '../assign/redux/match.actions';
import {WebSocketSubject} from 'rxjs/webSocket';


@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    private SERVER_URL = 'ws://127.0.0.1:9000/register';
    private socket: number;
    private websocketObservable: Observable<object>;
    private ws: WebSocket;

    private socket$: WebSocketSubject<any>;

    constructor(private store: Store<any>) {
    }


    initializeWebSocket() {
        this.socket$ = new WebSocketSubject(this.SERVER_URL);
        this.socket$.subscribe(
            (event) => this.handleData(event),
            (err) => console.log(err),
            () => console.warn('websocket completed')
        );
        // this.socket$.next({data: {}});

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

    createObservable(): Observable<any> {
        this.ws = new WebSocket(this.SERVER_URL);
        return new Observable(observer => {
                this.ws.onmessage = (event) => observer.next(this.tryGetMessageFromWebsocket(event));
                this.ws.onerror = (event) => observer.error(event);
                this.ws.onclose = (event) => observer.complete();
                this.ws.onopen = () => console.log('websocket registered.');
            }
        );
    }

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

    private handleData(data: any) {
        if (data.UpdateTable && data.UpdateTable.length > 0) {
            const newMatchData: Match[] = data.UpdateTable;
            this.store.dispatch(new LoadMatchesSuccess(newMatchData));
        }
    }

    private onError(data) {
        console.log('error');
        console.log(data);
    }
}
