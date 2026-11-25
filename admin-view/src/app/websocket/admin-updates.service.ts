import { Injectable, InjectionToken, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { StompUpdateTransport } from '../shared/update-events/stomp-transport';
import { connectUpdates, UpdateConnection, UpdateTransport } from '../shared/update-events/update-events';
import { ADMIN_UPDATES, reloadAction } from './admin-updates';

/** The transport for update events; tests provide an `InMemoryUpdateTransport`. */
export const UPDATE_TRANSPORT = new InjectionToken<UpdateTransport>('UpdateTransport', {
  providedIn: 'root',
  factory: () => new StompUpdateTransport(),
});

/** Keeps the admin state current by following the update events. */
@Injectable({ providedIn: 'root' })
export class AdminUpdatesService {
  private store = inject<Store<any>>(Store);
  private transport = inject(UPDATE_TRANSPORT);
  private connection?: UpdateConnection;

  start(): void {
    this.connection ??= connectUpdates(this.transport, ADMIN_UPDATES, (target) =>
      this.store.dispatch(reloadAction(target))
    );
  }

  stop(): void {
    this.connection?.disconnect();
    this.connection = undefined;
  }
}
