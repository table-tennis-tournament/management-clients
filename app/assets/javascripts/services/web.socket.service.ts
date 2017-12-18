import {Observable} from "rxjs/Rx";
import {Injectable, EventEmitter} from "@angular/core"
import { WebsocketMessage } from "app/assets/javascripts/data/websocket.message";

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
        var message = this.tryGetMessageFromWebsocket(e);
        if(message === null){
            return;
        }
        if(message.action === "MatchToTable"){
            this.OnTableRefresh.emit();
        }
        if (message.action === "MatchListAdd" ||
            message.action === "MatchListDelete" ||
            message.action === "MatchListMove"){
            this.OnWaitinglistRefresh.emit();
        }
        if(message.action === "MatchFree"){
            this.OnTableRefresh.emit();
            this.OnResultRefresh.emit();
        }
        if( message.action === "MatchTakeBack"){
            this.OnTableRefresh.emit();
        }
    }

    tryGetMessageFromWebsocket(event):WebsocketMessage{
        try{
            return JSON.parse(event.data);
        } catch(e){
            console.log(e)
        }
        return null;
    }

}