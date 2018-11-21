import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of, ReplaySubject, throwError} from 'rxjs';

import {MatchlistEffects} from './matchlist.effects';
import {LoadMatchList, MatchListActionTypes} from './matchlist.actions';
import {testData} from './test.data';
import {MatchListService} from '../matchlist.service';

describe('the match effects', () => {
    let actions: ReplaySubject<any>;
    let matchEffects: MatchlistEffects;
    let matchListService: MatchListService;


    beforeEach(() => {
        actions = new ReplaySubject<any>();
        TestBed.configureTestingModule({
            providers: [
                MatchlistEffects,
                MatchListService,
                HttpClient,
                HttpHandler,
                provideMockActions(() => actions)
            ]
        });
        matchListService = TestBed.get(MatchListService);
        matchEffects = TestBed.get(MatchlistEffects);
    });

    describe('loadMatchlist', () => {

        it('should return a LoadMatchListSuccess', (done) => {
            const expectedResult = new LoadMatchList(testData);
            spyOn(matchListService, 'loadAllMatchListItems').and.returnValue(of(testData));

            actions.next(new LoadMatchList(null));

            matchEffects.loadMatches$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadMatchListError', (done) => {
            spyOn(matchListService, 'loadAllMatchListItems').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadMatchList(null));

            matchEffects.loadMatches$.subscribe((result) => {
                expect(result.type).toEqual(MatchListActionTypes.LoadError);
                done();
            });
        });


    });

});
