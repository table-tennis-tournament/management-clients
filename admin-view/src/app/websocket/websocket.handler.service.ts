import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { auditTime, groupBy, mergeMap } from 'rxjs/operators';
import { LoadTables } from '../table/redux/table.actions';
import { LoadMatches } from '../assign/redux/match.actions';
import { LoadMatchList } from '../supervisor/redux/matchlist.actions';
import { LoadCallerMatches, LoadSecondCallMatches, LoadThirdCallMatches } from '../caller/redux/caller.actions';
import { LoadDiscipline } from '../discipline/redux/discipline.actions';
import { LoadResults } from '../result/redux/result.actions';
import { LoadPlayers } from '../player/redux/player.actions';
import { LoadTypeColors } from '../settings/redux/settings.actions';
import { ConnectWebSocket } from './redux/websocket.actions';
import { UpdateTopic, WebsocketMessage } from '../shared/websocket.service';

/** The pieces of state a client can reload. */
export type ReloadTarget =
  | 'matches'
  | 'tables'
  | 'caller'
  | 'secondCall'
  | 'thirdCall'
  | 'results'
  | 'matchList'
  | 'discipline'
  | 'players'
  | 'typeColors';

/** admin-view renders every area of the tournament, so it listens to all topics. */
export const ADMIN_TOPICS: UpdateTopic[] = ['matches', 'tables', 'queue', 'players', 'settings'];

/** Everything that is loaded when the application starts; reloaded after a reconnect. */
export const RESYNC_TARGETS: ReloadTarget[] = [
  'typeColors',
  'discipline',
  'matches',
  'tables',
  'matchList',
  'caller',
  'secondCall',
  'thirdCall',
  'results',
];

/** Events that can change a match, the tables, the call lists and the results. */
const MATCH_CHANGED: ReloadTarget[] = ['matches', 'tables', 'caller', 'secondCall', 'thirdCall', 'results'];

/** Maps each update event type to the state it invalidates. */
export const RELOAD_TARGETS_BY_EVENT: { [type: string]: ReloadTarget[] } = {
  MATCH_ASSIGNED: MATCH_CHANGED,
  MATCH_STARTED: MATCH_CHANGED,
  MATCH_RESULT_UPDATED: MATCH_CHANGED,
  MATCH_COMPLETED: MATCH_CHANGED,
  MATCH_FREED: MATCH_CHANGED,
  MATCH_TAKEN_BACK: MATCH_CHANGED,
  MATCH_DELETED: MATCH_CHANGED,
  MATCH_CALLED: ['caller', 'secondCall', 'thirdCall'],
  TABLE_LOCKED: ['tables'],
  TABLE_UNLOCKED: ['tables'],
  MATCH_LIST_CHANGED: ['matchList', 'matches'],
  PLAYER_REGISTERED: ['discipline', 'players'],
  PLAYER_UNREGISTERED: ['discipline', 'players'],
  PLAYER_PAID: ['players'],
  PLAYER_ACTIVE_CHANGED: ['players', 'discipline'],
  DISCIPLINE_COLORS_CHANGED: ['typeColors'],
};

/** Burst window: at most one reload per target within this period. */
export const RELOAD_AUDIT_MS = 200;

@Injectable({
  providedIn: 'root',
})
export class WebsocketHandlerService {
  private reloads$ = new Subject<ReloadTarget>();

  constructor(private store: Store<any>) {
    // per target: at most one reload per window, always for the latest trigger
    this.reloads$
      .pipe(
        groupBy((target) => target),
        mergeMap((group) => group.pipe(auditTime(RELOAD_AUDIT_MS)))
      )
      .subscribe((target) => this.reload(target));
  }

  public connectToWebsocket() {
    this.store.dispatch(
      new ConnectWebSocket({
        topics: ADMIN_TOPICS,
        message: this.handleWebsocketMessage.bind(this),
        connected: this.handleConnected.bind(this),
        disconnected: this.handleDisconnect.bind(this),
      })
    );
  }

  private handleConnected(reconnect: boolean) {
    // the initial load is done by the AppComponent; after a reconnect events may have been missed
    if (reconnect) {
      RESYNC_TARGETS.forEach((target) => this.reloads$.next(target));
    }
  }

  private handleDisconnect(event: any) {
    console.log('websocket disconnected', event);
  }

  private handleWebsocketMessage(message: WebsocketMessage) {
    const targets = RELOAD_TARGETS_BY_EVENT[message.type];
    if (!targets) {
      console.warn('unknown websocket message type', message.type);
      return;
    }
    targets.forEach((target) => this.reloads$.next(target));
  }

  private reload(target: ReloadTarget) {
    switch (target) {
      case 'matches':
        this.store.dispatch(new LoadMatches(null));
        break;
      case 'tables':
        this.store.dispatch(new LoadTables(null));
        break;
      case 'caller':
        this.store.dispatch(new LoadCallerMatches());
        break;
      case 'secondCall':
        this.store.dispatch(new LoadSecondCallMatches());
        break;
      case 'thirdCall':
        this.store.dispatch(new LoadThirdCallMatches());
        break;
      case 'results':
        this.store.dispatch(new LoadResults(null));
        break;
      case 'matchList':
        this.store.dispatch(new LoadMatchList(null));
        break;
      case 'discipline':
        this.store.dispatch(new LoadDiscipline(null));
        break;
      case 'players':
        this.store.dispatch(new LoadPlayers(null));
        break;
      case 'typeColors':
        this.store.dispatch(new LoadTypeColors());
        break;
    }
  }
}
