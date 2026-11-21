import { Injectable, InjectionToken, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { StompUpdateTransport } from '../shared/update-events/stomp-transport';
import { connectUpdates, UpdateConnection, UpdateTransport } from '../shared/update-events/update-events';
import * as ResultActions from '../result/redux/result.actions';
import { getSelectedTypeId } from '../result/redux/result.reducer';
import { ResultReloadTarget, resultUpdates } from './result-updates';

/** The transport for update events; tests provide an `InMemoryUpdateTransport`. */
export const UPDATE_TRANSPORT = new InjectionToken<UpdateTransport>('UpdateTransport', {
  providedIn: 'root',
  factory: () => new StompUpdateTransport(),
});

/** Keeps the displayed results current by following the update events. */
@Injectable({ providedIn: 'root' })
export class ResultUpdatesService {
  private store = inject(Store);
  private transport = inject(UPDATE_TRANSPORT);
  private connection?: UpdateConnection;

  start(): void {
    this.connection ??= connectUpdates(
      this.transport,
      resultUpdates(() => this.selectedTypeId()),
      (target) => this.reload(target)
    );
  }

  stop(): void {
    this.connection?.disconnect();
    this.connection = undefined;
  }

  private selectedTypeId(): number | null {
    let typeId: number | null = null;
    this.store
      .select(getSelectedTypeId)
      .pipe(take(1))
      .subscribe((current) => (typeId = current));
    return typeId;
  }

  private reload(target: ResultReloadTarget): void {
    if (target === 'types') {
      // loadTypesSuccess also reloads the matches of the displayed discipline
      this.store.dispatch(ResultActions.loadTypes());
      return;
    }
    const typeId = this.selectedTypeId();
    if (typeId != null) {
      this.store.dispatch(ResultActions.loadMatches({ typeId }));
    }
  }
}
