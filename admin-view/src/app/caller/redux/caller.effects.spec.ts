import { Mock } from 'vitest';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, ReplaySubject, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { emittedBy } from '../../testing/effects-testing';
import { StatusDto } from '../../shared/statusdto.model';
import { CallerEffects } from './caller.effects';
import { CallerService } from '../caller.service';
import {
  CallMatch,
  CallMatchError,
  CallMatchSuccess,
  LoadCallerMatches,
  LoadCallerMatchesError,
  LoadCallerMatchesSuccess,
  LoadRefereesList,
  LoadRefereesListError,
  LoadRefereesListSuccess,
  LoadSecondCallMatches,
  LoadThirdCallMatches,
  SecondCallMatch,
  SecondCallMatchError,
  SecondCallMatchSuccess,
} from './caller.actions';

describe('the caller effects', () => {
  const error = { msg: 'Error' };
  let actions: ReplaySubject<any>;
  let callerEffects: CallerEffects;
  let callerService: CallerService;
  let toast: { error: Mock; success: Mock; info: Mock };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        CallerEffects,
        CallerService,
        { provide: ToastrService, useValue: toast },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });
    callerService = TestBed.inject(CallerService);
    callerEffects = TestBed.inject(CallerEffects);
  });

  describe('load', () => {
    it('should return a LoadCallerMatchesSuccess', async () => {
      const load = vi.spyOn(callerService, 'loadMatchAggregateForCaller').mockReturnValue(of([]));

      const result = await emittedBy(callerEffects.load, actions, new LoadCallerMatches());

      expect(result).toStrictEqual([new LoadCallerMatchesSuccess([])]);
      expect(load.mock.calls).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadCallerMatchesError and show an error', async () => {
      vi.spyOn(callerService, 'loadMatchAggregateForCaller').mockReturnValue(throwError(() => error));

      const result = await emittedBy(callerEffects.load, actions, new LoadCallerMatches());

      expect(result).toStrictEqual([new LoadCallerMatchesError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Ausrufermatches']]);
    });
  });

  describe('loadReferees', () => {
    it('should return a LoadRefereesListSuccess', async () => {
      const load = vi.spyOn(callerService, 'loadAvailableReferees').mockReturnValue(of([]));

      const result = await emittedBy(callerEffects.loadRefereeList, actions, new LoadRefereesList(null));

      expect(result).toStrictEqual([new LoadRefereesListSuccess([])]);
      expect(load.mock.calls).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadRefereesListError and show an error', async () => {
      vi.spyOn(callerService, 'loadAvailableReferees').mockReturnValue(throwError(() => error));

      const result = await emittedBy(callerEffects.loadRefereeList, actions, new LoadRefereesList(null));

      expect(result).toStrictEqual([new LoadRefereesListError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Schiedsrichter']]);
    });
  });

  describe('callMatch', () => {
    it('should return a CallMatchSuccess and reload the caller matches', async () => {
      const status: StatusDto = { success: true };
      const call = vi.spyOn(callerService, 'callMatch').mockReturnValue(of(status));

      const result = await emittedBy(callerEffects.callMatch, actions, new CallMatch([1]));

      expect(result).toStrictEqual([new CallMatchSuccess(status), new LoadCallerMatches()]);
      expect(call.mock.calls).toEqual([[[1]]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a CallMatchError and show an error', async () => {
      vi.spyOn(callerService, 'callMatch').mockReturnValue(throwError(() => error));

      const result = await emittedBy(callerEffects.callMatch, actions, new CallMatch([1]));

      expect(result).toStrictEqual([new CallMatchError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Ausrufen des Matches']]);
    });
  });

  describe('announceRequestedCall', () => {
    it('announces the calls and reloads both lists of repeat calls', async () => {
      const status: StatusDto = { success: true };
      const announce = vi.spyOn(callerService, 'announceRequestedCalls').mockReturnValue(of(status));

      const result = await emittedBy(callerEffects.announceRequestedCall, actions, new SecondCallMatch([3]));

      expect(result).toStrictEqual([
        new SecondCallMatchSuccess(status),
        new LoadSecondCallMatches(),
        new LoadThirdCallMatches(),
      ]);
      expect(announce.mock.calls).toEqual([[[3]]]);
    });

    it('shows an error when the announcement fails', async () => {
      vi.spyOn(callerService, 'announceRequestedCalls').mockReturnValue(throwError(() => error));

      const result = await emittedBy(callerEffects.announceRequestedCall, actions, new SecondCallMatch([3]));

      expect(result).toStrictEqual([new SecondCallMatchError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Ausrufen der Spieler']]);
    });
  });
});
