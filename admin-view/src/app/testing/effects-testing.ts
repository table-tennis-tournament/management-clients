import { Action } from '@ngrx/store';
import { lastValueFrom, Observable, ReplaySubject } from 'rxjs';
import { toArray } from 'rxjs/operators';

/**
 * Dispatches [dispatched] into [actions$], completes the action stream and resolves with every action
 * [effect] emitted. Comparing the whole list catches an effect that emits more (or fewer) actions than
 * the test expects; a test that stops at the first emission does not.
 */
export function emittedBy<T>(
  effect: Observable<T>,
  actions$: ReplaySubject<Action>,
  ...dispatched: Action[]
): Promise<T[]> {
  dispatched.forEach((action) => actions$.next(action));
  actions$.complete();
  return lastValueFrom(effect.pipe(toArray()));
}
