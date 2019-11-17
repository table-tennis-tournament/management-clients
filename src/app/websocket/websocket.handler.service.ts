import {Injectable} from '@angular/core';
import {TableDto} from '../table/tabledto.model';
import {UpdateTablesSuccess} from '../table/redux/table.actions';
import {Match} from '../shared/data/match.model';
import {UpdateMatchesSuccess} from '../assign/redux/match.actions';
import {MatchList} from '../supervisor/matchlist.model';
import {LoadMatchListSuccess} from '../supervisor/redux/matchlist.actions';
import {ConnectWebSocket} from './redux/websocket.actions';
import {Store} from '@ngrx/store';
import {LoadCallerMatches} from '../caller/redux/caller.actions';

@Injectable({
    providedIn: 'root'
})
export class WebsocketHandlerService {

    constructor(private store: Store<any>) {
    }

    public connectToWebsocket() {
        console.log('start connecting to socket');
        this.store.dispatch(new ConnectWebSocket(
            {
                connected: this.handleWebsocketMessage.bind(this),
                disconnected: this.connectToWebsocket.bind(this)
            }));
    }

    private handleWebsocketMessage(data: any) {
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
            this.store.dispatch(new LoadCallerMatches());
            // this.store.dispatch(new LoadResultsSuccess(
            //     newMatchData.filter(match => match.state === MatchState[MatchState.Finished])));
        }
    }

}
