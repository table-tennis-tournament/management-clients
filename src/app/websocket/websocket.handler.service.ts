import {Injectable} from '@angular/core';
import {TableDto} from '../table/tabledto.model';
import {LoadTablesSuccess} from '../table/redux/table.actions';
import {Match} from '../shared/data/match.model';
import {LoadMatchesSuccess} from '../assign/redux/match.actions';
import {MatchList} from '../supervisor/matchlist.model';
import {LoadMatchListSuccess} from '../supervisor/redux/matchlist.actions';
import {ConnectWebSocket} from './redux/websocket.actions';
import {Store} from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class WebsocketHandlerService {

  constructor(private store: Store<any>) { }

    public connectToWebsocket() {
        console.log('start connecting to socket');
        this.store.dispatch(new ConnectWebSocket(
            {
                connected: this.handleWebsocketMessage.bind(this),
                disconnected: this.connectToWebsocket.bind(this)
            }));
    }

    private handleWebsocketMessage(data: any) {
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

}
