import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryUpdateTransport } from '../shared/update-events/in-memory-transport';
import { DEFAULT_AUDIT_MS } from '../shared/update-events/update-events';
import { loadTables } from './redux/table-list.actions';
import { TableUpdatesService, UPDATE_TRANSPORT } from './table-updates.service';

describe('the table updates service', () => {
  let transport: InMemoryUpdateTransport;
  let dispatched: any[];

  beforeEach(() => {
    vi.useFakeTimers();
    dispatched = [];
    transport = new InMemoryUpdateTransport();
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
        { provide: UPDATE_TRANSPORT, useValue: transport },
      ],
    });
    const store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch').mockImplementation((action: any) => dispatched.push(action));
    TestBed.inject(TableUpdatesService).start();
  });

  afterEach(() => {
    TestBed.inject(TableUpdatesService).stop();
    vi.useRealTimers();
  });

  const event = (type: string, tableIds: number[]) => ({ type, scope: { matchIds: [1], typeIds: [], tableIds } });

  it('listens to the tables and matches topics', () => {
    expect(transport.topics).toEqual(['tables', 'matches']);
  });

  it('reloads the tables of the displayed manager when one of its tables is concerned', () => {
    transport.publish('matches', event('MATCH_RESULT_UPDATED', [6]));
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([loadTables({ tableManagerId: 2 })]);
  });

  it('does not reload for tables of other managers', () => {
    transport.publish('matches', event('MATCH_RESULT_UPDATED', [15]));
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([]);
  });

  it('coalesces a burst of events into a single reload', () => {
    for (let i = 0; i < 20; i++) {
      transport.publish('matches', event('MATCH_TAKEN_BACK', [6]));
    }
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([loadTables({ tableManagerId: 2 })]);
  });

  it('does not reload on the first connect, because the route loads the tables', () => {
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([]);
  });

  it('resynchronizes after a reconnect', () => {
    transport.drop();
    transport.reconnect();
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([loadTables({ tableManagerId: 2 })]);
  });
});
