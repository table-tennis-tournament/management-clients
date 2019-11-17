import {Injectable} from '@angular/core';
import {TableDto} from '../table/tabledto.model';
import {LoadTablesSuccess, UpdateTablesSuccess} from '../table/redux/table.actions';
import {Match} from '../shared/data/match.model';
import {LoadMatchesSuccess, UpdateMatchesSuccess} from '../assign/redux/match.actions';
import {MatchList} from '../supervisor/matchlist.model';
import {LoadMatchListSuccess} from '../supervisor/redux/matchlist.actions';
import {ConnectTableWebSocket, ConnectMatchWebSocket, ConnectMatchListWebSocket} from './redux/websocket.actions';
import {Store} from '@ngrx/store';
import {LoadResultsSuccess} from '../result/redux/result.actions';
import {MatchState} from '../shared/data/matchstate.model';
import {Load} from '../caller/redux/caller.actions';

@Injectable({
    providedIn: 'root'
})
export class WebsocketHandlerService {

    constructor(private store: Store<any>) {
    }


    public connectToWebsocket() {
        console.log('start connecting to socket');
        this.connectToTableWebsocket();
        // this.connectToMatchWebsocket();
        // this.connectToMatchListWebsocket();
    }

    private connectToTableWebsocket() {
        this.store.dispatch(new ConnectTableWebSocket(
            {
                connected: this.handleTableWebsocketMessage.bind(this),
                disconnected: this.connectToTableWebsocket.bind(this)
            }));
    }

    private connectToMatchWebsocket() {
        this.store.dispatch(new ConnectMatchWebSocket(
            {
                connected: this.handleMatchWebsocketMessage.bind(this),
                disconnected: this.connectToMatchWebsocket.bind(this)
            }));
    }

    private connectToMatchListWebsocket() {
        this.store.dispatch(new ConnectMatchListWebSocket(
            {
                connected: this.handleMatchListWebsocketMessage.bind(this),
                disconnected: this.connectToMatchListWebsocket.bind(this)
            }));
    }

    private handleMatchWebsocketMessage(data: any) {
        console.log('handle match websocker message: ' + data);
        console.log(data);
        if (data.UpdateMatches) {
            const updatedMatches: Match[] = data.UpdateMatches;
            this.store.dispatch(new UpdateMatchesSuccess(updatedMatches));
            // this.store.dispatch(new Load());
            // this.store.dispatch(new LoadResultsSuccess(
            //     newMatchData.filter(match => match.state === MatchState[MatchState.Finished])));
        }
    }

    private handleTableWebsocketMessage(data: any) {
        console.log('handle websocket message: ');
        console.log(data);
        if (data.UpdateTable && data.UpdateTable.length > 0) {
            const updatedTables: TableDto[] = data.UpdateTable;
            this.store.dispatch(new UpdateTablesSuccess(updatedTables));
        }
        if (data.UpdateMatchList) {
            const newMatchlistItems: MatchList[] = data.UpdateMatchList;
            this.store.dispatch(new LoadMatchListSuccess(newMatchlistItems));
        }
        if (data.UpdateMatches) {
            const updatedMatches: Match[] = data.UpdateMatches;
            this.store.dispatch(new UpdateMatchesSuccess(updatedMatches));
            // this.store.dispatch(new Load());
            // this.store.dispatch(new LoadResultsSuccess(
            //     newMatchData.filter(match => match.state === MatchState[MatchState.Finished])));
        }
    }

    private handleMatchListWebsocketMessage(data: any) {
        console.log('handle matchList websocker message: ');
        console.log(data);
        if (data.UpdateMatchList) {
            const newMatchlistItems: MatchList[] = data.UpdateMatchList;
            this.store.dispatch(new LoadMatchListSuccess(newMatchlistItems));
        }
    }

}
