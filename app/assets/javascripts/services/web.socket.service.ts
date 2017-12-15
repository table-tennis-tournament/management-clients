import {Observable} from "rxjs/Rx";
import {Injectable, EventEmitter} from "@angular/core"

@Injectable()
export class WebSocketService {

    public WebSocketObservable:Observable<any>;

    public OnTableRefresh: EventEmitter<any> = new EventEmitter<any>();
    public OnWaitinglistRefresh: EventEmitter<any> = new EventEmitter<any>();
    public OnResultRefresh: EventEmitter<any> = new EventEmitter<any>();

    private ws: WebSocket;

    initializeWebSocket(url) {
        this.WebSocketObservable = Observable.create(this.createObserver.bind(this, url)).share();
    }

    createObserver(url, observer){
        this.ws = new WebSocket(url);
    
        // observer.next("testdata");
        this.ws.onopen = this.onWebsocketConnected.bind(this);

        this.ws.onclose = (e) => {
            if (e.wasClean) {
                observer.complete();
            } else {
                observer.error(e);
            }
        };

        this.ws.onerror = (e) => {
            observer.error(e);
        }

        this.ws.onmessage = this.onMessageFromWebserviceGot.bind(this);

        return () => {
            this.ws.close();
        };
    }

    onWebsocketConnected(e){
        console.log("WebSocket was successfully registered.");
    }

    onMessageFromWebserviceGot(e){
        if(e.data==="MatchesUpdated"){
            this.OnTableRefresh.emit();
        }
    }

}