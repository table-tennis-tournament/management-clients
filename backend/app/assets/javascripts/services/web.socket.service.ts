import {Observable} from "rxjs/Rx";
import {Injectable} from "@angular/core"

@Injectable()
export class WebSocketService {

    public wsObservable:Observable<any>;
    private ws: WebSocket;

    initializeWebSocket(url) {
        this.wsObservable = Observable.create((observer) => {
            
            this.ws = new WebSocket(url);

            this.ws.onopen = (e) => {
                console.log("WebSocket was successfully registered.");
            };

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

            this.ws.onmessage = (e) => {
                console.log(e);
                console.log("on Message de websocket");
                if(e.data==="MatchesUpdated"){
                    observer.next("Update Message");
                }
                
            }

            return () => {
                this.ws.close();
            };
        }).share();
  }
}