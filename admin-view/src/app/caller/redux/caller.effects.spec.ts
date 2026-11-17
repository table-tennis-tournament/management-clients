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
} from './caller.actions';

describe('the caller effects', () => {
  const error = { msg: 'Error' };
  let actions: ReplaySubject<any>;
  let callerEffects: CallerEffects;
  let callerService: CallerService;
  let toast: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = jasmine.createSpyObj('ToastrService', ['error', 'success', 'info']);
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
      const load = spyOn(callerService, 'loadMatchAggregateForCaller').and.returnValue(of([]));

      const result = await emittedBy(callerEffects.load, actions, new LoadCallerMatches());

      expect(result).toEqual([new LoadCallerMatchesSuccess([])]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadCallerMatchesError and show an error', async () => {
      spyOn(callerService, 'loadMatchAggregateForCaller').and.returnValue(throwError(() => error));

      const result = await emittedBy(callerEffects.load, actions, new LoadCallerMatches());

      expect(result).toEqual([new LoadCallerMatchesError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der Ausrufermatches']]);
    });
  });

  describe('loadReferees', () => {
    it('should return a LoadRefereesListSuccess', async () => {
      const load = spyOn(callerService, 'loadAvailableReferees').and.returnValue(of([]));

      const result = await emittedBy(callerEffects.loadRefereeList, actions, new LoadRefereesList(null));

      expect(result).toEqual([new LoadRefereesListSuccess([])]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadRefereesListError and show an error', async () => {
      spyOn(callerService, 'loadAvailableReferees').and.returnValue(throwError(() => error));

      const result = await emittedBy(callerEffects.loadRefereeList, actions, new LoadRefereesList(null));

      expect(result).toEqual([new LoadRefereesListError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der Schiedsrichter']]);
    });
  });

  describe('callMatch', () => {
    it('should return a CallMatchSuccess and reload the caller matches', async () => {
      const status: StatusDto = { message: 'ok' }; // passed through unchanged
      const call = spyOn(callerService, 'callMatch').and.returnValue(of(status));

      const result = await emittedBy(callerEffects.callMatch, actions, new CallMatch([1]));

      expect(result).toEqual([new CallMatchSuccess(status), new LoadCallerMatches()]);
      expect(call.calls.allArgs()).toEqual([[[1]]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a CallMatchError and show an error', async () => {
      spyOn(callerService, 'callMatch').and.returnValue(throwError(() => error));

      const result = await emittedBy(callerEffects.callMatch, actions, new CallMatch([1]));

      expect(result).toEqual([new CallMatchError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Ausrufen des Matches']]);
    });
  });
});
