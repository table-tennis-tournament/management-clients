import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, timer } from 'rxjs';

/** The current time (ms), updated every minute: enough for the minutes players have been waited for. */
@Injectable({ providedIn: 'root' })
export class MinuteClock {
  readonly now = toSignal(timer(0, 60_000).pipe(map(() => Date.now())), { initialValue: Date.now() });
}
