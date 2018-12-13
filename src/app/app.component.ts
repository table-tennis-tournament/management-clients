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
        this.websocketService.initializeWebSocket('ws://127.0.0.1:9000/register');
    }
}
