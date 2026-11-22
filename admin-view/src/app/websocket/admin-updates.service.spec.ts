import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { InMemoryUpdateTransport } from '../shared/update-events/in-memory-transport';
import { DEFAULT_AUDIT_MS, UpdateTopic } from '../shared/update-events/update-events';
import { MatchActionTypes } from '../assign/redux/match.actions';
import { CallerActionTypes } from '../caller/redux/caller.actions';
import { ResultActionTypes } from '../result/redux/result.actions';
import { TableActionTypes } from '../table/redux/table.actions';
import { ADMIN_UPDATES, AdminReloadTarget, reloadAction } from './admin-updates';
import { AdminUpdatesService, UPDATE_TRANSPORT } from './admin-updates.service';
// The envelopes the backend publishes, recorded by its UpdateTopicsIT (management-backend/src/test/resources/expected/events).
import matchAssigned from '../../../../management-backend/src/test/resources/expected/events/matches/match-assigned.json';
import matchCallRequested from '../../../../management-backend/src/test/resources/expected/events/matches/match-call-requested.json';
import matchCalledSecondCall from '../../../../management-backend/src/test/resources/expected/events/matches/match-called-second-call.json';
import matchCalledBulk from '../../../../management-backend/src/test/resources/expected/events/matches/match-called-bulk.json';
import matchCalled from '../../../../management-backend/src/test/resources/expected/events/matches/match-called.json';
import matchCompleted from '../../../../management-backend/src/test/resources/expected/events/matches/match-completed.json';
import matchDeleted from '../../../../management-backend/src/test/resources/expected/events/matches/match-deleted.json';
import matchFreed from '../../../../management-backend/src/test/resources/expected/events/matches/match-freed.json';
import matchSidesSet from '../../../../management-backend/src/test/resources/expected/events/matches/match-sides-set.json';
import matchResultUpdated from '../../../../management-backend/src/test/resources/expected/events/matches/match-result-updated.json';
import matchStarted from '../../../../management-backend/src/test/resources/expected/events/matches/match-started.json';
import matchTakenBack from '../../../../management-backend/src/test/resources/expected/events/matches/match-taken-back.json';
import playerActiveChanged from '../../../../management-backend/src/test/resources/expected/events/players/player-active-changed.json';
import playerPaid from '../../../../management-backend/src/test/resources/expected/events/players/player-paid.json';
import playerRegistered from '../../../../management-backend/src/test/resources/expected/events/players/player-registered.json';
import playerUnregistered from '../../../../management-backend/src/test/resources/expected/events/players/player-unregistered.json';
import matchListChanged from '../../../../management-backend/src/test/resources/expected/events/queue/match-list-changed.json';
import disciplineColorsChanged from '../../../../management-backend/src/test/resources/expected/events/settings/discipline-colors-changed.json';
import disciplineShortNameChanged from '../../../../management-backend/src/test/resources/expected/events/settings/discipline-short-name-changed.json';
import tableLocked from '../../../../management-backend/src/test/resources/expected/events/tables/table-locked.json';
import tableUnlocked from '../../../../management-backend/src/test/resources/expected/events/tables/table-unlocked.json';

const MATCH_CHANGED: AdminReloadTarget[] = ['matches', 'tables', 'caller', 'secondCall', 'thirdCall', 'results'];

/** Every recorded backend event, the Topic it is published on and what admin-view reloads for it. */
const BACKEND_EVENTS: { name: string; topic: UpdateTopic; event: any; reloads: AdminReloadTarget[] }[] = [
  { name: 'match-assigned', topic: 'matches', event: matchAssigned, reloads: MATCH_CHANGED },
  // the called matches are on no table, and the call lists only show matches at a table
  { name: 'match-called-bulk', topic: 'matches', event: matchCalledBulk, reloads: [] },
  {
    name: 'match-called',
    topic: 'matches',
    event: matchCalled,
    reloads: ['tables', 'caller', 'secondCall', 'thirdCall'],
  },
  {
    name: 'match-called-second-call',
    topic: 'matches',
    event: matchCalledSecondCall,
    reloads: ['tables', 'caller', 'secondCall', 'thirdCall'],
  },
  {
    name: 'match-call-requested',
    topic: 'matches',
    event: matchCallRequested,
    reloads: ['tables', 'secondCall', 'thirdCall'],
  },
  { name: 'match-completed', topic: 'matches', event: matchCompleted, reloads: MATCH_CHANGED },
  { name: 'match-deleted', topic: 'matches', event: matchDeleted, reloads: MATCH_CHANGED },
  { name: 'match-freed', topic: 'matches', event: matchFreed, reloads: MATCH_CHANGED },
  { name: 'match-result-updated', topic: 'matches', event: matchResultUpdated, reloads: MATCH_CHANGED },
  { name: 'match-sides-set', topic: 'matches', event: matchSidesSet, reloads: MATCH_CHANGED },
  { name: 'match-started', topic: 'matches', event: matchStarted, reloads: MATCH_CHANGED },
  { name: 'match-taken-back', topic: 'matches', event: matchTakenBack, reloads: MATCH_CHANGED },
  { name: 'player-active-changed', topic: 'players', event: playerActiveChanged, reloads: ['players', 'discipline'] },
  { name: 'player-paid', topic: 'players', event: playerPaid, reloads: ['players'] },
  { name: 'player-registered', topic: 'players', event: playerRegistered, reloads: ['discipline', 'players'] },
  { name: 'player-unregistered', topic: 'players', event: playerUnregistered, reloads: ['discipline', 'players'] },
  { name: 'match-list-changed', topic: 'queue', event: matchListChanged, reloads: ['matchList', 'matches'] },
  { name: 'discipline-colors-changed', topic: 'settings', event: disciplineColorsChanged, reloads: ['typeColors'] },
  {
    name: 'discipline-short-name-changed',
    topic: 'settings',
    event: disciplineShortNameChanged,
    reloads: ['shortNames'],
  },
  { name: 'table-locked', topic: 'tables', event: tableLocked, reloads: ['tables'] },
  { name: 'table-unlocked', topic: 'tables', event: tableUnlocked, reloads: ['tables'] },
];

describe('the admin updates service', () => {
  let transport: InMemoryUpdateTransport;
  let dispatched: string[];

  beforeEach(() => {
    vi.useFakeTimers();
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

  afterEach(() => {
    TestBed.inject(AdminUpdatesService).stop();
    vi.useRealTimers();
  });

  const publish = (topic: UpdateTopic, type: string, tableIds: number[]) =>
    transport.publish(topic, { type, scope: { matchIds: [1], typeIds: [], tableIds } });

  it('listens to all five topics', () => {
    expect(transport.topics).toEqual(['matches', 'tables', 'queue', 'players', 'settings']);
  });

  it('handles exactly the event types the backend publishes', () => {
    const backendTypes = [...new Set(BACKEND_EVENTS.map(({ event }) => event.type))].sort();
    expect(Object.keys(ADMIN_UPDATES.reloads).sort()).toEqual(backendTypes);
  });

  BACKEND_EVENTS.forEach(({ name, topic, event, reloads }) => {
    it(`reloads ${reloads.join(', ') || 'nothing'} for the backend's ${name} event`, () => {
      transport.publish(topic, event);
      vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
      expect(dispatched).toEqual(reloads.map((target) => reloadAction(target).type));
    });
  });

  it('reloads every match view when a match on a table changes', () => {
    publish('matches', 'MATCH_TAKEN_BACK', [3]);
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([
      MatchActionTypes.Load,
      TableActionTypes.Load,
      CallerActionTypes.Load,
      CallerActionTypes.LoadSecondCallMatches,
      CallerActionTypes.LoadThirdCallMatches,
      ResultActionTypes.Load,
    ]);
  });

  it('leaves the tables and call lists alone for a match that is on no table', () => {
    publish('matches', 'MATCH_FREED', []);
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([MatchActionTypes.Load, ResultActionTypes.Load]);
  });

  it('coalesces a burst into one reload per target', () => {
    for (let i = 0; i < 10; i++) {
      publish('tables', 'TABLE_LOCKED', [i + 1]);
    }
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toEqual([TableActionTypes.Load]);
  });

  it('resynchronizes after a reconnect', () => {
    transport.drop();
    transport.reconnect();
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched.length).toEqual(ADMIN_UPDATES.resync.length);
  });
});
