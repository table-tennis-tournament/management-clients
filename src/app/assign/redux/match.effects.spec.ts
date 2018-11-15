import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ToastrService} from 'ngx-toastr';
import {IndividualConfig} from 'ngx-toastr/toastr/toastr-config';
import {of, ReplaySubject, throwError} from 'rxjs';
import {MatchService} from '../../match/match.service';

import {MatchEffects} from './match.effects';
import {LoadMatches, LoadMatchesSuccess, MatchActionTypes} from './match.actions';
import {MatchTestData} from './test-data';

describe('the match effects', () => {
    let actions: ReplaySubject<any>;
    let matchEffects: MatchEffects;
    let matchService: MatchService;
    const responseMatches = MatchTestData;


    const toastServiceMock: ToastrService = <ToastrService>{
        error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null
    };

    beforeEach(() => {
        actions = new ReplaySubject<any>();
        TestBed.configureTestingModule({
            providers: [
                MatchEffects,
                MatchService,
                {provide: ToastrService, useValue: toastServiceMock},
                HttpClient,
                HttpHandler,
                provideMockActions(() => actions)
            ]
        });

        matchEffects = TestBed.get(MatchEffects);
        matchService = TestBed.get(MatchService);
    });

    describe('loadMatches', () => {

        it('should return a LoadMatchesSuccess', (done) => {
            const expectedResult = new LoadMatchesSuccess(responseMatches);
            spyOn(matchService, 'loadAllMatches').and.returnValue(of(responseMatches));

            actions.next(new LoadMatches(null));

            matchEffects.loadMatches$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadTableError', (done) => {
            spyOn(matchService, 'loadAllMatches').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadMatches(null));

            matchEffects.loadMatches$.subscribe((result) => {
                expect(result.type).toEqual(MatchActionTypes.LoadError);
                done();
            });
            // expect(toastServiceMock.error).toHaveBeenCalled();
        });


    });

});
