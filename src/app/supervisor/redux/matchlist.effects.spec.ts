import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of, ReplaySubject, throwError} from 'rxjs';

import {MatchListEffects} from './matchlist.effects';
import {LoadMatchList, LoadMatchListSuccess, MatchListActionTypes} from './matchlist.actions';
import {testData} from './test.data';
import {MatchListService} from '../matchlist.service';
import {IndividualConfig, ToastrService} from 'ngx-toastr';

describe('the match effects', () => {
    let actions: ReplaySubject<any>;
    let matchListEffects: MatchListEffects;
    let matchListService: MatchListService;

    const toastServiceMock: ToastrService = <ToastrService>{
        error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null
    };

    beforeEach(() => {
        actions = new ReplaySubject<any>();
        TestBed.configureTestingModule({
            providers: [
                MatchListEffects,
                MatchListService,
                {provide: ToastrService, useValue: toastServiceMock},
                HttpClient,
                HttpHandler,
                provideMockActions(() => actions)
            ]
        });
        matchListService = TestBed.get(MatchListService);
        matchListEffects = TestBed.get(MatchListEffects);
    });

    describe('loadMatchlist', () => {

        it('should return a LoadMatchListSuccess', (done) => {
            const expectedResult = new LoadMatchListSuccess(testData);
            spyOn(matchListService, 'loadAllMatchListItems').and.returnValue(of(testData));

            actions.next(new LoadMatchList(null));

            matchListEffects.loadMatchList$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadMatchListError', (done) => {
            spyOn(matchListService, 'loadAllMatchListItems').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadMatchList(null));

            matchListEffects.loadMatchList$.subscribe((result) => {
                expect(result.type).toEqual(MatchListActionTypes.LoadError);
                done();
            });
        });


    });

});
