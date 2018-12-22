import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of, ReplaySubject, throwError} from 'rxjs';

import {IndividualConfig, ToastrService} from 'ngx-toastr';
import {CallerEffects} from './caller.effects';
import {CallerService} from '../caller.service';
import {CallerActionTypes, CallMatch, CallMatchSuccess, LoadRefereesList, LoadRefereesListSuccess} from './caller.actions';

describe('the match effects', () => {
    let actions: ReplaySubject<any>;
    let callerEffects: CallerEffects;
    let callerService: CallerService;

    const toastServiceMock: ToastrService = <ToastrService>{
        error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null
    };

    beforeEach(() => {
        actions = new ReplaySubject<any>();
        TestBed.configureTestingModule({
            providers: [
                CallerEffects,
                CallerService,
                {provide: ToastrService, useValue: toastServiceMock},
                HttpClient,
                HttpHandler,
                provideMockActions(() => actions)
            ]
        });
        callerService = TestBed.get(CallerService);
        callerEffects = TestBed.get(CallerEffects);
    });

    describe('loadReferees', () => {

        it('should return a LoadRefereesListSuccess', (done) => {
            const expectedResult = new LoadRefereesListSuccess([]);
            spyOn(callerService, 'loadAvailableReferees').and.returnValue(of([]));

            actions.next(new LoadRefereesList(null));

            callerEffects.loadRefereeList$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadRefereesListError', (done) => {
            spyOn(callerService, 'loadAvailableReferees').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadRefereesList(null));

            callerEffects.loadRefereeList$.subscribe((result) => {
                expect(result.type).toEqual(CallerActionTypes.LoadError);
                done();
            });
        });
    });

    describe('callMatch', () => {

        it('should return a CallMatchSuccess', (done) => {
            const expectedResult = new CallMatchSuccess({});
            spyOn(callerService, 'callMatch').and.returnValue(of({}));

            actions.next(new CallMatch([1]));

            callerEffects.callMatch$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a CallMatchError', (done) => {
            spyOn(callerService, 'callMatch').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new CallMatch(null));

            callerEffects.callMatch$.subscribe((result) => {
                expect(result.type).toEqual(CallerActionTypes.CallMatchError);
                done();
            });
        });
    });
});
