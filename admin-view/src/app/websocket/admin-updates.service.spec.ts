import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { InMemoryUpdateTransport } from '../shared/update-events/in-memory-transport';
import { DEFAULT_AUDIT_MS, UpdateTopic } from '../shared/update-events/update-events';
import { MatchActionTypes } from '../assign/redux/match.actions';
import { CallerActionTypes } from '../caller/redux/caller.actions';
import { ResultActionTypes } from '../result/redux/result.actions';
import { TableActionTypes } from '../table/redux/table.actions';
import { ADMIN_UPDATES } from './admin-updates';
import { AdminUpdatesService, UPDATE_TRANSPORT } from './admin-updates.service';

describe('the admin updates service', () => {
  let transport: InMemoryUpdateTransport;
  let dispatched: string[];

  beforeEach(() => {
    dispatched = [];
    transport = new InMemoryUpdateTransport();
    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: { dispatch: (action: any) => dispatched.push(action.type) } },
        { provide: UPDATE_TRANSPORT, useValue: transport },
      ],
    });
    TestBed.inject(AdminUpdatesService).start();
  });

  afterEach(() => TestBed.inject(AdminUpdatesService).stop());

  const publish = (topic: UpdateTopic, type: string, tableIds: number[]) =>
    transport.publish(topic, { type, scope: { matchIds: [1], typeIds: [], tableIds } });

  it('listens to all five topics', () => {
    expect(transport.topics).toEqual(['matches', 'tables', 'queue', 'players', 'settings']);
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
      'PLAYER_ACTIVE_CHANGED',
      'DISCIPLINE_COLORS_CHANGED',
    ];
    backendEvents.forEach((type) => expect(ADMIN_UPDATES.reloads[type]).toBeDefined());
  });

  it('reloads every match view when a match on a table changes', fakeAsync(() => {
    publish('matches', 'MATCH_TAKEN_BACK', [3]);
    tick(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([
      MatchActionTypes.Load,
      TableActionTypes.Load,
      CallerActionTypes.Load,
      CallerActionTypes.LoadSecondCallMatches,
      CallerActionTypes.LoadThirdCallMatches,
      ResultActionTypes.Load,
    ]);
  }));

  it('leaves the tables and call lists alone for a match that is on no table', fakeAsync(() => {
    publish('matches', 'MATCH_FREED', []);
    tick(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([MatchActionTypes.Load, ResultActionTypes.Load]);
  }));

  it('coalesces a burst into one reload per target', fakeAsync(() => {
    for (let i = 0; i < 10; i++) {
      publish('tables', 'TABLE_LOCKED', [i + 1]);
    }
    tick(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([TableActionTypes.Load]);
  }));

  it('resynchronizes after a reconnect', fakeAsync(() => {
    transport.drop();
    transport.reconnect();
    tick(DEFAULT_AUDIT_MS);
    expect(dispatched.length).toEqual(ADMIN_UPDATES.resync.length);
  }));
});
