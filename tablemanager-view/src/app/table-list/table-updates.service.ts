import { Injectable, InjectionToken, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { StompUpdateTransport } from '../shared/update-events/stomp-transport';
import { connectUpdates, UpdateConnection, UpdateTransport } from '../shared/update-events/update-events';
import { loadTables } from './redux/table-list.actions';
import { getTableManagerId, getTables } from './redux/table-list.reducer';
import { Table } from './tt-table/table.model';
import { tablemanagerUpdates } from './update-events';

/** The transport for update events; tests provide an `InMemoryUpdateTransport`. */
export const UPDATE_TRANSPORT = new InjectionToken<UpdateTransport>('UpdateTransport', {
  providedIn: 'root',
  factory: () => new StompUpdateTransport(),
});

/** Keeps the displayed tables current by following the update events. */
@Injectable({ providedIn: 'root' })
export class TableUpdatesService {
  private store = inject<Store<any>>(Store);
  private transport = inject(UPDATE_TRANSPORT);
  private connection?: UpdateConnection;

  start(): void {
    this.connection ??= connectUpdates(
      this.transport,
      tablemanagerUpdates(() => this.displayedTables()),
      () => this.reloadTables()
    );
  }

  stop(): void {
    this.connection?.disconnect();
    this.connection = undefined;
  }

  private displayedTables(): Table[] {
    let tables: Table[] = [];
    this.store
      .select(getTables)
      .pipe(take(1))
      .subscribe((current) => (tables = current ?? []));
    return tables;
  }

  private reloadTables(): void {
    this.store
      .select(getTableManagerId)
      .pipe(take(1))
      .subscribe((tableManagerId) => {
        if (tableManagerId != null) {
          this.store.dispatch(loadTables({ tableManagerId }));
        }
      });
  }
}
