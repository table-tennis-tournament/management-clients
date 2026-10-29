import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { WebsocketHandlerService, RELOAD_AUDIT_MS, RELOAD_TARGETS_BY_EVENT } from './websocket.handler.service';
import { WebSocketActionTypes } from './redux/websocket.actions';
import { MatchActionTypes } from '../assign/redux/match.actions';
import { TableActionTypes } from '../table/redux/table.actions';
import { MatchListActionTypes } from '../supervisor/redux/matchlist.actions';
import { PlayerActionTypes } from '../player/redux/player.actions';
import { SettingsActionTypes } from '../settings/redux/settings.actions';
import { DisciplineActionTypes } from '../discipline/redux/discipline.actions';

describe('the websocket handler service', () => {
  let service: WebsocketHandlerService;
  let dispatched: string[];
  let listeners: any;

  beforeEach(() => {
    dispatched = [];
    const store = {
      dispatch: (action: any) => {
        if (action.type === WebSocketActionTypes.ConnectWebsocket) {
          listeners = action.payload;
        } else {
          dispatched.push(action.type);
        }
      },
    };
    TestBed.configureTestingModule({ providers: [{ provide: Store, useValue: store }] });
    service = TestBed.inject(WebsocketHandlerService);
    service.connectToWebsocket();
  });

  it('listens to all five topics', () => {
    expect(listeners.topics).toEqual(['matches', 'tables', 'queue', 'players', 'settings']);
  });

  it('covers every event type the backend publishes', () => {
    const backendEvents = [
      'MATCH_ASSIGNED',
      'MATCH_STARTED',
      'MATCH_RESULT_UPDATED',
      'MATCH_COMPLETED',
      'MATCH_FREED',
      'MATCH_TAKEN_BACK',
      'MATCH_CALLED',
      'MATCH_DELETED',
      'TABLE_LOCKED',
      'TABLE_UNLOCKED',
      'MATCH_LIST_CHANGED',
      'PLAYER_REGISTERED',
      'PLAYER_UNREGISTERED',
      'PLAYER_PAID',
      'DISCIPLINE_COLORS_CHANGED',
    ];
    backendEvents.forEach((type) => expect(RELOAD_TARGETS_BY_EVENT[type]).toBeDefined());
  });

  it('reloads matches and tables when a match is taken back', fakeAsync(() => {
    listeners.message({ type: 'MATCH_TAKEN_BACK', payload: {} });
    tick(RELOAD_AUDIT_MS);
    expect(dispatched).toContain(MatchActionTypes.Load);
    expect(dispatched).toContain(TableActionTypes.Load);
  }));

  it('coalesces a burst of the same event into one reload per target', fakeAsync(() => {
    for (let i = 0; i < 20; i++) {
      listeners.message({ type: 'MATCH_FREED', payload: {} });
    }
    tick(RELOAD_AUDIT_MS);
    expect(dispatched.filter((type) => type === MatchActionTypes.Load).length).toBe(1);
    expect(dispatched.filter((type) => type === TableActionTypes.Load).length).toBe(1);
  }));

  it('does not lose the reload of a different target inside the same window', fakeAsync(() => {
    listeners.message({ type: 'MATCH_FREED', payload: {} });
    listeners.message({ type: 'MATCH_LIST_CHANGED', payload: {} });
    listeners.message({ type: 'PLAYER_PAID', payload: {} });
    listeners.message({ type: 'DISCIPLINE_COLORS_CHANGED', payload: {} });
    tick(RELOAD_AUDIT_MS);
    expect(dispatched).toContain(TableActionTypes.Load);
    expect(dispatched).toContain(MatchListActionTypes.Load);
    expect(dispatched).toContain(PlayerActionTypes.Load);
    expect(dispatched).toContain(SettingsActionTypes.LoadTypeColors);
  }));

  it('reloads the matches as well when the queue changes', fakeAsync(() => {
    listeners.message({ type: 'MATCH_LIST_CHANGED', payload: {} });
    tick(RELOAD_AUDIT_MS);
    expect(dispatched).toContain(MatchListActionTypes.Load);
    expect(dispatched).toContain(MatchActionTypes.Load);
  }));

  it('reloads the players when a player registers', fakeAsync(() => {
    listeners.message({ type: 'PLAYER_REGISTERED', payload: {} });
    tick(RELOAD_AUDIT_MS);
    expect(dispatched).toContain(PlayerActionTypes.Load);
    expect(dispatched).toContain(DisciplineActionTypes.Load);
  }));

  it('ignores unknown event types', fakeAsync(() => {
    spyOn(console, 'warn');
    listeners.message({ type: 'SOMETHING_NEW', payload: {} });
    tick(RELOAD_AUDIT_MS);
    expect(dispatched).toEqual([]);
  }));

  it('does not reload on the first connect, because the app loads its initial state itself', fakeAsync(() => {
    listeners.connected(false);
    tick(RELOAD_AUDIT_MS);
    expect(dispatched).toEqual([]);
  }));

  it('resynchronizes the displayed state after a reconnect', fakeAsync(() => {
    listeners.connected(true);
    tick(RELOAD_AUDIT_MS);
    expect(dispatched).toContain(MatchActionTypes.Load);
    expect(dispatched).toContain(TableActionTypes.Load);
    expect(dispatched).toContain(MatchListActionTypes.Load);
    expect(dispatched).toContain(DisciplineActionTypes.Load);
    expect(dispatched).toContain(SettingsActionTypes.LoadTypeColors);
  }));
});
