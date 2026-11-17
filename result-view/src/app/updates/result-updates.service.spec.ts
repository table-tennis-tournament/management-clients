import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryUpdateTransport } from '../shared/update-events/in-memory-transport';
import { DEFAULT_AUDIT_MS } from '../shared/update-events/update-events';
import * as ResultActions from '../result/redux/result.actions';
import { ResultUpdatesService, UPDATE_TRANSPORT } from './result-updates.service';
import { resultUpdates } from './result-updates';
// The envelopes the backend publishes, recorded by its UpdateTopicsIT; they all concern discipline 1.
import matchAssigned from '../../../../management-backend/src/test/resources/expected/events/matches/match-assigned.json';
import matchCalled from '../../../../management-backend/src/test/resources/expected/events/matches/match-called.json';
import matchCompleted from '../../../../management-backend/src/test/resources/expected/events/matches/match-completed.json';
import matchDeleted from '../../../../management-backend/src/test/resources/expected/events/matches/match-deleted.json';
import matchFreed from '../../../../management-backend/src/test/resources/expected/events/matches/match-freed.json';
import matchResultUpdated from '../../../../management-backend/src/test/resources/expected/events/matches/match-result-updated.json';
import matchStarted from '../../../../management-backend/src/test/resources/expected/events/matches/match-started.json';
import matchTakenBack from '../../../../management-backend/src/test/resources/expected/events/matches/match-taken-back.json';

const RESULT_CHANGES = { matchCompleted, matchDeleted, matchFreed, matchResultUpdated, matchTakenBack };
const NO_RESULT_CHANGES = { matchAssigned, matchCalled, matchStarted };

describe('the result updates service', () => {
  let transport: InMemoryUpdateTransport;
  let dispatched: unknown[];
  let service: ResultUpdatesService | undefined;

  const start = (selectedTypeId: number | null) => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: { disciplines: { types: [], selectedTypeId } } }),
        { provide: UPDATE_TRANSPORT, useValue: transport },
      ],
    });
    const store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch').mockImplementation(((action: unknown) => {
      dispatched.push(action);
    }) as MockStore['dispatch']);
    service = TestBed.inject(ResultUpdatesService);
    service.start();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    dispatched = [];
    transport = new InMemoryUpdateTransport();
    service = undefined;
  });

  afterEach(() => {
    service?.stop();
    vi.useRealTimers();
  });

  it('listens to the matches topic only', () => {
    start(1);
    expect(transport.topics).toStrictEqual(['matches']);
  });

  Object.entries(RESULT_CHANGES).forEach(([name, event]) => {
    it(`reloads the displayed discipline for the backend's ${name} event`, () => {
      start(1);
      transport.publish('matches', event as any);
      vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
      expect(dispatched).toStrictEqual([ResultActions.loadMatches({ typeId: 1 })]);
    });

    it(`ignores the backend's ${name} event of another discipline`, () => {
      start(2);
      transport.publish('matches', event as any);
      vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
      expect(dispatched).toStrictEqual([]);
    });
  });

  Object.entries(NO_RESULT_CHANGES).forEach(([name, event]) => {
    it(`does not reload for the backend's ${name} event, which changes no result`, () => {
      start(1);
      transport.publish('matches', event as any);
      vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
      expect(dispatched).toStrictEqual([]);
    });
  });

  it('knows every match event the backend publishes', () => {
    const config = resultUpdates(() => 1);
    const handled = [...Object.keys(config.reloads), ...(config.ignored ?? [])].sort();
    const backend = Object.values({ ...RESULT_CHANGES, ...NO_RESULT_CHANGES })
      .map((event) => event.type)
      .sort();
    expect(handled).toStrictEqual(backend);
  });

  it('reloads the types, and with them the matches, after a reconnect', () => {
    start(1);
    transport.drop();
    transport.reconnect();
    vi.advanceTimersByTime(DEFAULT_AUDIT_MS);
    expect(dispatched).toStrictEqual([ResultActions.loadTypes()]);
  });
});
