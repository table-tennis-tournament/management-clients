import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {WebsocketService} from '../services/websocket.service';
import {updatedMatchToTable} from './redux/table-list.actions';
import {Table} from './tt-table/table.model';

@Injectable({
    providedIn: 'root'
})
export class WebsocketHandlerService {

    constructor(private store: Store<any>, private websocketService: WebsocketService) {
    }

    public connectToWebsocket() {
        console.log('start connecting to socket');
        this.websocketService.connectSocks(
            {
                connected: this.handleWebsocketMessage.bind(this),
                disconnected: this.connectToWebsocket.bind(this)
            }).subscribe(this.onConnected.bind(this));
    }

    private handleWebsocketMessage(data: any) {
        console.log('handle websocket message: ');
        console.log(data);
        if (data.UpdateTableManager) {
            const tables: Table[] = data.UpdateTableManager;
            if (tables.length > 0) {
                this.store.dispatch(updatedMatchToTable({tables}));
            }
        }
    }

    onConnected() {
        console.log('on connected executed');
    }
}
