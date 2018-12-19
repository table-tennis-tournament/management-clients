import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {ConnectWebSocket} from './websocket/redux/websocket.actions';
import {TableDto} from './table/tabledto.model';
import {LoadTables, LoadTablesSuccess} from './table/redux/table.actions';
import {Match} from './shared/data/match.model';
import {LoadMatches, LoadMatchesSuccess} from './assign/redux/match.actions';
import {MatchList} from './supervisor/matchlist.model';
import {LoadMatchList, LoadMatchListSuccess} from './supervisor/redux/matchlist.actions';
import {LoadDiscipline} from './discipline/redux/discipline.actions';

@Component({
    selector: 'toma-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private store: Store<any>) {
    }

    ngOnInit(): void {
        this.connectToWebsocket();
        this.store.dispatch(new LoadDiscipline(null));
        this.store.dispatch(new LoadMatches(null));
        this.store.dispatch(new LoadTables(null));
        this.store.dispatch(new LoadMatchList(null));
    }

    handleWebsocketMessage(data: any) {
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
}
