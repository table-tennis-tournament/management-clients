import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { lastValueFrom, Observable, of, throwError } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { MatchService } from '../match.service';
import { MatchEffects } from './match.effects';
import * as MatchActions from './match.actions';

/** Each command of a table manager: the action, the service call it makes, and what follows. */
const commands = [
  {
    name: 'entering an interim result',
    action: MatchActions.updateMatchResult({ matchId: 7, result: { games: [] } }),
    service: 'updateMatchResult',
    args: [7, { games: [] }],
    effect: 'updateMatchResult$',
    success: MatchActions.updateMatchResultSuccess(),
    error: MatchActions.updateMatchResultError(),
    errorEffect: 'updateMatchResultError$',
    message: 'Ergebnis konnte nicht eingetragen werden.',
  },
  {
    name: 'finishing a match',
    action: MatchActions.finishMatch({ matchId: 7, result: { games: [] } }),
    service: 'finishMatch',
    args: [7, { games: [] }],
    effect: 'finishMatch',
    success: MatchActions.finishMatchSuccess(),
    error: MatchActions.finishMatchError(),
    errorEffect: 'finishMatchError$',
    message: 'Ergebnis nicht vollständig.',
  },
  {
    name: 'starting a match',
    action: MatchActions.startMatchOnTable({ tableId: 30, matchId: 7 }),
    service: 'startMatch',
    args: [30, 7],
    effect: 'startMatch',
    success: MatchActions.startMatchOnTableSuccess(),
    error: MatchActions.startMatchOnTableError(),
    errorEffect: 'startMatchError$',
    message: 'Spiel konnte nicht gestartet werden',
  },
  {
    name: 'requesting a call',
    action: MatchActions.callPlayerForMatch({ matchId: 7, playerIds: [3] }),
    service: 'callPlayersForMatch',
    args: [7, [3]],
    effect: 'callPlayerForMatch',
    success: MatchActions.callPlayerForMatchSuccess(),
    error: MatchActions.callPlayerForMatchError(),
    errorEffect: 'callPlayerForMatchError$',
    message: 'Spieler konnte nicht ausgerufen werden',
  },
  {
    name: 'taking back a match',
    action: MatchActions.takeBackMatch({ matchId: 7 }),
    service: 'takeBackMatch',
    args: [7],
    effect: 'takeBackMatch$',
    success: MatchActions.takeBackMatchSuccess(),
    error: MatchActions.takeBackMatchError(),
    errorEffect: 'takeBackMatchError$',
    message: 'Spiel konnte nicht zurück genommen werden.',
  },
];

describe('the commands of a table manager', () => {
  function setup(action: Action, service: Record<string, unknown>) {
    const snackBar = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        MatchEffects,
        provideMockActions(() => of(action)),
        provideMockStore({ initialState: { tables: { tableManagerId: 1, tables: [] } } }),
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatchService, useValue: service },
      ],
    });
    return { effects: TestBed.inject(MatchEffects) as unknown as Record<string, Observable<Action>>, snackBar };
  }

  const emitted = (effect: Observable<Action>) => lastValueFrom(effect.pipe(toArray()));

  for (const command of commands) {
    describe(command.name, () => {
      it('calls the backend and reports success', async () => {
        const call = vi.fn(() => of({ success: true }));
        const { effects } = setup(command.action, { [command.service]: call });

        expect(await emitted(effects[command.effect])).toStrictEqual([command.success]);
        expect(call.mock.calls).toStrictEqual([command.args]);
      });

      it('reports an error when the backend fails', async () => {
        const { effects } = setup(command.action, { [command.service]: () => throwError(() => new Error('down')) });

        expect(await emitted(effects[command.effect])).toStrictEqual([command.error]);
      });

      it('tells the table manager about the error', async () => {
        const { effects, snackBar } = setup(command.error, {});

        await emitted(effects[command.errorEffect]);

        expect(snackBar.open.mock.calls).toStrictEqual([[command.message]]);
      });
    });
  }
});
