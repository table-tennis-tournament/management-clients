import {Component, OnInit} from '@angular/core';
import {WebsocketHandlerService} from './table-list/websocket-handler.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

    constructor(private websocketHandler: WebsocketHandlerService) {
    }

    ngOnInit(): void {
        this.websocketHandler.connectToWebsocket();
    }
}
