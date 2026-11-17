import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
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
  let toast: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = jasmine.createSpyObj('ToastrService', ['error', 'success', 'info']);
    TestBed.configureTestingModule({
      providers: [
        MatchEffects,
        MatchService,
        { provide: ToastrService, useValue: toast },
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
      const load = spyOn(matchService, 'loadAllMatches').and.returnValue(of(MatchTestData));

      const result = await emittedBy(matchEffects.loadMatches, actions, new LoadMatches(null));

      expect(result).toEqual([new LoadMatchesSuccess(MatchTestData)]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadMatchesError and show an error', async () => {
      spyOn(matchService, 'loadAllMatches').and.returnValue(throwError(() => error));

      const result = await emittedBy(matchEffects.loadMatches, actions, new LoadMatches(null));

      expect(result).toEqual([new LoadMatchesError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der Matches', '']]);
    });
  });

  describe('reloadMatches', () => {
    it('should return a ReloadMatchesSuccess and confirm it', async () => {
      const statusDto = { success: true };
      const reload = spyOn(matchService, 'reloadMatchesFromDb').and.returnValue(of(statusDto));

      const result = await emittedBy(matchEffects.reloadMatches, actions, new ReloadMatches());

      expect(result).toEqual([new ReloadMatchesSuccess(statusDto)]);
      expect(reload.calls.allArgs()).toEqual([[]]);
      expect(toast.success.calls.allArgs()).toEqual([['Daten erfolgreich geladen', '']]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a ReloadMatchesError and show an error', async () => {
      spyOn(matchService, 'reloadMatchesFromDb').and.returnValue(throwError(() => error));

      const result = await emittedBy(matchEffects.reloadMatches, actions, new ReloadMatches());

      expect(result).toEqual([new ReloadMatchesError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Lesen der Matches aus der DB', '']]);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});
