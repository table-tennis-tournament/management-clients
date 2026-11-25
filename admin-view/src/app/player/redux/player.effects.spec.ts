import { Mock } from 'vitest';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { NotificationService } from '../../shared/notification.service';
import { of, ReplaySubject, throwError } from 'rxjs';
import { emittedBy } from '../../testing/effects-testing';
import { PlayerService } from '../player.service';
import { PlayerType } from '../data/player.type.model';
import { PlayerEffects } from './player.effects';
import {
  LoadPlayers,
  LoadPlayersError,
  LoadPlayersSuccess,
  SetPlayerPaid,
  SetPlayerPaidError,
  SetPlayerPaidSuccess,
} from './player.actions';

describe('the player effects', () => {
  const error = { msg: 'Error' };
  const registration: PlayerType = { id: 3, type: { id: 1, name: 'Herren' }, paid: true };
  let actions: ReplaySubject<any>;
  let effects: PlayerEffects;
  let playerService: PlayerService;
  let notifications: { error: Mock; success: Mock };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    notifications = { error: vi.fn(), success: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        PlayerEffects,
        PlayerService,
        { provide: NotificationService, useValue: notifications },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });
    effects = TestBed.inject(PlayerEffects);
    playerService = TestBed.inject(PlayerService);
  });

  it('loads the registrations', async () => {
    const load = vi.spyOn(playerService, 'getAllPlayerTypes').mockReturnValue(of([registration]));

    expect(await emittedBy(effects.loadTables, actions, new LoadPlayers(null))).toStrictEqual([
      new LoadPlayersSuccess([registration]),
    ]);
    expect(load.mock.calls).toEqual([[]]);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('shows an error when the registrations do not load', async () => {
    vi.spyOn(playerService, 'getAllPlayerTypes').mockReturnValue(throwError(() => error));

    expect(await emittedBy(effects.loadTables, actions, new LoadPlayers(null))).toStrictEqual([
      new LoadPlayersError(error),
    ]);
    expect(notifications.error.mock.calls).toEqual([['Fehler beim Laden der Spieler']]);
  });

  it('marks a registration as paid', async () => {
    const paid = vi.spyOn(playerService, 'setPlayerPaid').mockReturnValue(of({ success: true }));

    expect(await emittedBy(effects.playerPaid, actions, new SetPlayerPaid(registration))).toStrictEqual([
      new SetPlayerPaidSuccess(registration),
    ]);
    expect(paid.mock.calls).toEqual([[registration]]);
  });

  it('shows an error when marking as paid fails', async () => {
    vi.spyOn(playerService, 'setPlayerPaid').mockReturnValue(throwError(() => error));

    expect(await emittedBy(effects.playerPaid, actions, new SetPlayerPaid(registration))).toStrictEqual([
      new SetPlayerPaidError(error),
    ]);
    expect(notifications.error.mock.calls).toEqual([['Fehler beim aktiv setzen des Spielers']]);
  });
});
