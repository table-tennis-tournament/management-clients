import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebsocketService } from '../services/websocket.service';
import { WebsocketHandlerService } from './websocket-handler.service';
import { loadTables } from './redux/table-list.actions';
import { RELOAD_AUDIT_MS, TABLEMANAGER_TOPICS } from './update-events';

describe('the websocket handler service', () => {
  let listeners: any;
  let store: MockStore;
  let dispatched: any[];

  beforeEach(() => {
    vi.useFakeTimers();
    dispatched = [];
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: {
            tables: {
              tableManagerId: 2,
              tables: [
                { table_id: 6, matches: [] },
                { table_id: 7, matches: [] },
              ],
            },
          },
        }),
        {
          provide: WebsocketService,
          useValue: {
            connect: (l: any) => {
              listeners = l;
              return { subscribe: () => undefined };
            },
          },
        },
      ],
    });
    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch').mockImplementation((action: any) => dispatched.push(action));
    TestBed.inject(WebsocketHandlerService).connectToWebsocket();
  });

  afterEach(() => vi.useRealTimers());

  const message = (type: string, tableIds?: number[]) => ({
    type,
    scope: tableIds ? { matchIds: [1], tableIds } : undefined,
    payload: {},
  });

  it('listens to the tables and matches topics only', () => {
    expect(listeners.topics).toEqual(TABLEMANAGER_TOPICS);
    expect(listeners.topics).toEqual(['tables', 'matches']);
  });

  it('reloads the tables of the displayed manager when one of its tables is concerned', () => {
    listeners.message(message('MATCH_RESULT_UPDATED', [6]));
    vi.advanceTimersByTime(RELOAD_AUDIT_MS);
    expect(dispatched).toEqual([loadTables({ tableManagerId: 2 })]);
  });

  it('does not reload for tables of other managers', () => {
    listeners.message(message('MATCH_RESULT_UPDATED', [15]));
    vi.advanceTimersByTime(RELOAD_AUDIT_MS);
    expect(dispatched).toEqual([]);
  });

  it('coalesces a burst of events into a single reload', () => {
    for (let i = 0; i < 20; i++) {
      listeners.message(message('MATCH_TAKEN_BACK', [6]));
    }
    vi.advanceTimersByTime(RELOAD_AUDIT_MS);
    expect(dispatched).toEqual([loadTables({ tableManagerId: 2 })]);
  });

  it('does not reload on the first connect, because the route loads the tables', () => {
    listeners.connected(false);
    vi.advanceTimersByTime(RELOAD_AUDIT_MS);
    expect(dispatched).toEqual([]);
  });

  it('resynchronizes after a reconnect', () => {
    listeners.connected(true);
    vi.advanceTimersByTime(RELOAD_AUDIT_MS);
    expect(dispatched).toEqual([loadTables({ tableManagerId: 2 })]);
  });
});
