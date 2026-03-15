import { Component, OnInit, inject } from '@angular/core';
import {WebsocketHandlerService} from './table-list/websocket-handler.service';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [NavigationComponent, RouterOutlet]
})
export class AppComponent implements OnInit{
    private websocketHandler = inject(WebsocketHandlerService);


    ngOnInit(): void {
        this.websocketHandler.connectToWebsocket();
    }
}
