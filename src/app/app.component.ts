import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {ConnectWebSocket} from './websocket/redux/websocket.actions';
import {TableDto} from './table/tabledto.model';
import {LoadTablesSuccess} from './table/redux/table.actions';
import {Match} from './shared/data/match.model';
import {LoadMatchesSuccess} from './assign/redux/match.actions';
import {MatchList} from './supervisor/matchlist.model';
import {LoadMatchListSuccess} from './supervisor/redux/matchlist.actions';

@Component({
    selector: 'toma-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private store: Store<any>) {
    }

    ngOnInit(): void {
        this.connectToWebsocket();
    }

    handleWebsocketMessage(data: any) {
        console.log('message received');
        console.log(data);
        if (data.UpdateTable && data.UpdateTable.length > 0) {
            const newTables: TableDto[] = data.UpdateTable;
            this.store.dispatch(new LoadTablesSuccess(newTables));
        }
        if (data.UpdateMatches && data.UpdateMatches.length > 0) {
            const newMatchData: Match[] = data.UpdateMatches;
            this.store.dispatch(new LoadMatchesSuccess(newMatchData));
        }
        if (data.UpdateMatchList) {
            const newMatchlistItems: MatchList[] = data.UpdateMatchList;
            this.store.dispatch(new LoadMatchListSuccess(newMatchlistItems));
        }
    }

    connectToWebsocket() {
        console.log('start connecting to socket');
        this.store.dispatch(new ConnectWebSocket(
            {
                connected: this.handleWebsocketMessage.bind(this),
                disconnected: this.connectToWebsocket.bind(this)
            }));
    }

    reconnectEvent() {
        console.log('reconnect');
    }
}
