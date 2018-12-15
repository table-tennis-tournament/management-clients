import {Component, OnInit} from '@angular/core';
import {WebsocketService} from './shared/websocket.service';

@Component({
    selector: 'toma-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private websocketService: WebsocketService) {
    }


    ngOnInit(): void {
        this.websocketService.initializeWebSocket();
    }
}
