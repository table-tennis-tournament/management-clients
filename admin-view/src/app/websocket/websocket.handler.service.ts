import { Injectable } from '@angular/core';
import { TableDto } from '../table/tabledto.model';
import { UpdateTablesSuccess } from '../table/redux/table.actions';
import { Match } from '../shared/data/match.model';
import { UpdateMatchesSuccess } from '../assign/redux/match.actions';
import { MatchList } from '../supervisor/matchlist.model';
import { LoadMatchListSuccess } from '../supervisor/redux/matchlist.actions';
import { Store } from '@ngrx/store';
import { LoadCallerMatches, LoadSecondCallMatches, LoadThirdCallMatches } from '../caller/redux/caller.actions';
import { ConnectWebSocket } from './redux/websocket.actions';
import { UpdateResults } from '../result/redux/result.actions';
import { MatchState } from '../shared/data/matchstate.model';

@Injectable({
  providedIn: 'root',
})
export class WebsocketHandlerService {
  constructor(private store: Store<any>) {}

  public connectToWebsocket() {
    console.log('start connecting to socket');
    this.store.dispatch(
      new ConnectWebSocket({
        connected: this.handleWebsocketMessage.bind(this),
        disconnected: this.connectToWebsocket.bind(this),
      })
    );
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
      this.store.dispatch(
        new UpdateResults(updatedMatches.filter((match) => this.matchesAreFinishedOrCompleted(match)))
      );
      const secondOrThirdCallMatches = updatedMatches.filter((match) => this.matchHasSecondOrThirdCall(match));
      if (secondOrThirdCallMatches.length > 0) {
        this.store.dispatch(new LoadSecondCallMatches());
        this.store.dispatch(new LoadThirdCallMatches());
      }
    }
  }

  private matchesAreFinishedOrCompleted(match) {
    return [MatchState[MatchState.Finished], MatchState[MatchState.Completed]].indexOf(match.state) > -1;
  }

  private matchHasSecondOrThirdCall(match: Match) {
    return [MatchState[MatchState.SecondCall], MatchState[MatchState.ThirdCall]].indexOf(match.state) > -1;
  }
}
