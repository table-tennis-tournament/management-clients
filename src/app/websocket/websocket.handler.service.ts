import {Injectable} from '@angular/core';
import {TableDto} from '../table/tabledto.model';
import {LoadTablesSuccess, UpdateTablesSuccess} from '../table/redux/table.actions';
import {Match} from '../shared/data/match.model';
import {LoadMatchesSuccess, UpdateMatchesSuccess} from '../assign/redux/match.actions';
import {MatchList} from '../supervisor/matchlist.model';
import {LoadMatchListSuccess} from '../supervisor/redux/matchlist.actions';
import {ConnectTableWebSocket, ConnectMatchWebSocket} from './redux/websocket.actions';
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
        this.connectToMatchWebsocket();
    }

    private connectToTableWebsocket() {
        this.store.dispatch(new ConnectTableWebSocket(
            {
                connected: this.handleTableWebsocketMessage.bind(this),
                disconnected: this.connectToTableWebsocket.bind(this)
            }));
    }

    private connectToMatchWebsocket() {
        this.store.dispatch(new ConnectTableWebSocket(
            {
                connected: this.handleMatchWebsocketMessage.bind(this),
                disconnected: this.connectToMatchWebsocket.bind(this)
            }));
    }

    private handleMatchWebsocketMessage(data: any) {
        console.log('handle match websocker message: ' + data);
        console.log(data);
        if (data.UpdateMatches) {
            const newMatchData: Match[] = data.UpdateMatches;
            this.store.dispatch(new UpdateMatchesSuccess(newMatchData));
            // this.store.dispatch(new Load());
            // this.store.dispatch(new LoadResultsSuccess(
            //     newMatchData.filter(match => match.state === MatchState[MatchState.Finished])));
        }
    }

    private handleTableWebsocketMessage(data: any) {
        console.log('handle table websocker message: ');
        console.log(data);
        if (data.UpdateTable && data.UpdateTable.length > 0) {
            const newTables: TableDto[] = data.UpdateTable;
            this.store.dispatch(new UpdateTablesSuccess(newTables));
        }
    }

}
