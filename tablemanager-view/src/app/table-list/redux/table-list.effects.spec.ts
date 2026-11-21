import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { defer, Observable, of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TableService } from '../table.service';
import * as TableActions from './table-list.actions';
import { LOAD_RETRIES, LOAD_RETRY_DELAY_MS, TableListEffects } from './table-list.effects';

describe('the table list effects', () => {
  let snackBarAction: Subject<void>;
  let snackBarCalls: unknown[][];

  const effectsWith = (action: Action, getTables: () => Observable<unknown>) => {
    TestBed.configureTestingModule({
      providers: [
        TableListEffects,
        provideMockActions(() => of(action)),
        { provide: TableService, useValue: { getTables } },
        {
          provide: MatSnackBar,
          useValue: {
            open: (...args: unknown[]) => {
              snackBarCalls.push(args);
              return { onAction: () => snackBarAction };
            },
          },
        },
      ],
    });
    return TestBed.inject(TableListEffects);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    snackBarAction = new Subject<void>();
    snackBarCalls = [];
  });

  afterEach(() => vi.useRealTimers());

  it('retries a failed load before it succeeds', () => {
    let attempts = 0;
    const tables = [{ table_id: 1, matches: [] }];
    // like HttpClient, every subscription is a new request
    const effects = effectsWith(TableActions.loadTables({ tableManagerId: 2 }), () =>
      defer(() => (++attempts <= LOAD_RETRIES ? throwError(() => new Error('down')) : of(tables)))
    );
    const emitted: Action[] = [];
    effects.loadTables$.subscribe((action) => emitted.push(action));

    vi.advanceTimersByTime(LOAD_RETRIES * LOAD_RETRY_DELAY_MS);

    expect(attempts).toBe(LOAD_RETRIES + 1);
    expect(emitted).toStrictEqual([TableActions.loadTablesSuccess({ tables })]);
  });

  it('reports an error after the retries, for the same table manager', () => {
    const effects = effectsWith(TableActions.loadTables({ tableManagerId: 2 }), () =>
      throwError(() => new Error('down'))
    );
    const emitted: Action[] = [];
    effects.loadTables$.subscribe((action) => emitted.push(action));

    vi.advanceTimersByTime(LOAD_RETRY_DELAY_MS);
    expect(emitted).toStrictEqual([]);

    vi.advanceTimersByTime(LOAD_RETRIES * LOAD_RETRY_DELAY_MS);
    expect(emitted).toStrictEqual([TableActions.loadTablesError({ tableManagerId: 2 })]);
  });

  it('loads the tables again when the table manager asks for it', () => {
    const effects = effectsWith(TableActions.loadTablesError({ tableManagerId: 2 }), () => of([]));
    const emitted: Action[] = [];
    effects.loadTablesError$.subscribe((action) => emitted.push(action));

    expect(snackBarCalls).toStrictEqual([['Die Tische konnten nicht geladen werden.', 'Erneut laden']]);
    expect(emitted).toStrictEqual([]);

    snackBarAction.next();
    expect(emitted).toStrictEqual([TableActions.loadTables({ tableManagerId: 2 })]);
  });
});
