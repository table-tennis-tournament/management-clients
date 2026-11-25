import { Mock } from 'vitest';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { NotificationService } from '../../shared/notification.service';
import { of, ReplaySubject, throwError } from 'rxjs';
import { emittedBy } from '../../testing/effects-testing';
import { MatchService } from '../match.service';
import { MatchEffects } from './match.effects';
import {
  LoadMatches,
  LoadMatchesError,
  LoadMatchesSuccess,
  ReloadMatches,
  ReloadMatchesError,
  ReloadMatchesSuccess,
} from './match.actions';
import { MatchTestData } from './test-data';

describe('the match effects', () => {
  const error = { msg: 'Error' };
  let actions: ReplaySubject<any>;
  let matchEffects: MatchEffects;
  let matchService: MatchService;
  let notifications: { error: Mock; success: Mock; info: Mock };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    notifications = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        MatchEffects,
        MatchService,
        { provide: NotificationService, useValue: notifications },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });

    matchEffects = TestBed.inject(MatchEffects);
    matchService = TestBed.inject(MatchService);
  });

  describe('loadMatches', () => {
    it('should return a LoadMatchesSuccess', async () => {
      const load = vi.spyOn(matchService, 'loadAllMatches').mockReturnValue(of(MatchTestData));

      const result = await emittedBy(matchEffects.loadMatches, actions, new LoadMatches(null));

      expect(result).toStrictEqual([new LoadMatchesSuccess(MatchTestData)]);
      expect(load.mock.calls).toEqual([[]]);
      expect(notifications.error).not.toHaveBeenCalled();
    });

    it('should return a LoadMatchesError and show an error', async () => {
      vi.spyOn(matchService, 'loadAllMatches').mockReturnValue(throwError(() => error));

      const result = await emittedBy(matchEffects.loadMatches, actions, new LoadMatches(null));

      expect(result).toStrictEqual([new LoadMatchesError(error)]);
      expect(notifications.error.mock.calls).toEqual([['Fehler beim Laden der Matches']]);
    });
  });

  describe('reloadMatches', () => {
    it('should return a ReloadMatchesSuccess and confirm it', async () => {
      const statusDto = { success: true };
      const reload = vi.spyOn(matchService, 'reloadMatchesFromDb').mockReturnValue(of(statusDto));

      const result = await emittedBy(matchEffects.reloadMatches, actions, new ReloadMatches());

      expect(result).toStrictEqual([new ReloadMatchesSuccess(statusDto)]);
      expect(reload.mock.calls).toEqual([[]]);
      expect(notifications.success.mock.calls).toEqual([['Daten erfolgreich geladen']]);
      expect(notifications.error).not.toHaveBeenCalled();
    });

    it('should return a ReloadMatchesError and show an error', async () => {
      vi.spyOn(matchService, 'reloadMatchesFromDb').mockReturnValue(throwError(() => error));

      const result = await emittedBy(matchEffects.reloadMatches, actions, new ReloadMatches());

      expect(result).toStrictEqual([new ReloadMatchesError(error)]);
      expect(notifications.error.mock.calls).toEqual([['Fehler beim Lesen der Matches aus der DB']]);
      expect(notifications.success).not.toHaveBeenCalled();
    });
  });
});
