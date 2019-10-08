import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export abstract class WebsocketService {

    private connectedState = false;
    private websocket: WebSocket;
    private backendUrl: string;
    private explicitClosed = true;

    connected = new BehaviorSubject<boolean>(false);
    logMessages = new BehaviorSubject<string>('');
    lastMessages: string[] = [];

    get stopped(): boolean {
        return this.explicitClosed;
    }

    sendMessage(message) {
        if (!this.websocket) {
            this.connect();
            this.websocket.send(message);
        } else if (this.connectedState) {
            this.websocket.send(message);
        }
    }

    disconnectWS(explicit = true) {
        this.explicitClosed = explicit;
        if (this.websocket) {
            this.websocket.close();
            if (explicit) {
                this.close();
            }
        } else {
            this.close();
        }
    }

    private close() {
        if (this.websocket) {
            this.websocket.onerror = undefined;
            this.websocket.onclose = undefined;
            this.websocket.onopen = undefined;
            this.websocket.onmessage = undefined;
            this.websocket.close();
        }
        this.websocket = undefined;
        this.connectedState = false;
        this.connected.next(this.connectedState);
    }

    public isWebsocketConnected(): boolean {
        return this.websocket && this.websocket.readyState === this.websocket.OPEN;
    }

    private isWebsocketConnecting(): boolean {
        return this.websocket && this.websocket.readyState === this.websocket.CONNECTING;
    }

    public shouldConnectAgain(): boolean {
        return !(this.isWebsocketConnected() || this.isWebsocketConnecting());
    }

    protected getWebsocketBackendUrl(): string {
        let host = location.host;
        const path = '/'; // location.pathname;
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        let apiPath = 'api/tables/ws';

        host = (protocol + '//' + host + path).replace('index.html', '');

        return host + apiPath;
    }

    protected handleWebsocketMessage(message: any): boolean {
        const type = message.type;
        switch (type) {
            //     case 'DurchgangStarted':
            //       this._activeDurchgangList = [...this.activeDurchgangList, (message as DurchgangStarted)];
            //       this.durchgangStarted.next(this.activeDurchgangList);
            //       return true;

            //     case 'DurchgangFinished':
            //       const finished = (message as DurchgangFinished);
            //       this._activeDurchgangList = this.activeDurchgangList
            //         .filter(d => d.durchgang !== finished.durchgang || d.wettkampfUUID !== finished.wettkampfUUID);
            //       this.durchgangStarted.next(this.activeDurchgangList);
            //       return true;

            //     case 'AthletWertungUpdatedSequenced':
            //     case 'AthletWertungUpdated':
            //       const updated = (message as AthletWertungUpdated);
            //       this.wertungen = this.wertungen.map(w => {
            //         if (w.id === updated.wertung.athletId && w.wertung.wettkampfdisziplinId === updated.wertung.wettkampfdisziplinId ) {
            //           return Object.assign({}, w, {wertung: updated.wertung });
            //         } else {
            //           return w;
            //         }
            //       });
            //       this.wertungenSubject.next(this.wertungen);
            //       this.wertungUpdated.next(updated);
            //       return true;

            //     case 'AthletMovedInWettkampf':
            //     case 'AthletRemovedFromWettkampf':
            //       this.loadWertungen();
            //       return true;

            //     case 'NewLastResults':
            //       this.newLastResults.next((message as NewLastResults));
            //       return true;

            //     case 'MessageAck':
            //       console.log((message as MessageAck).msg);
            //       this.showMessage.next((message as MessageAck));
            //       return true;

            default:
                return false;
        }
    }

    public initWebsocket() {
        this.logMessages.subscribe(msg => {
            this.lastMessages.push(msg);
            this.lastMessages = this.lastMessages.slice(Math.max(this.lastMessages.length - 50, 0));
        });
        this.logMessages.next('init');
        this.backendUrl = this.getWebsocketBackendUrl();
        this.logMessages.next('init with ' + this.backendUrl);

        this.connect();
    }

    private connect() {
        this.disconnectWS();
        this.explicitClosed = false;
        this.websocket = new WebSocket(this.backendUrl);
        this.websocket.onopen = () => {
            this.connectedState = true;
            this.connected.next(this.connectedState);
        };

        this.websocket.onclose = (evt: CloseEvent) => {
            this.close();
        };

        this.websocket.onmessage = (evt: MessageEvent) => {
            try {
                const jsonMessage = JSON.parse(evt.data);
                const type = jsonMessage.type;
                switch (type) {
                    default:
                        if (!this.handleWebsocketMessage(jsonMessage)) {
                            console.log(jsonMessage);
                            this.logMessages.next('unknown message: ' + evt.data);
                        }
                }
            } catch (e) {
                this.logMessages.next(e + ': ' + evt.data);
            }
        };

        this.websocket.onerror = (e: ErrorEvent) => {
            this.logMessages.next(e.message + ', ' + e.type);
        };
    }
}
