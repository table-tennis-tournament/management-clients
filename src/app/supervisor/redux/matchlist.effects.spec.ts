import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of, ReplaySubject, throwError} from 'rxjs';

import {MatchListEffects} from './matchlist.effects';
import {
    AssignToMatchList,
    AssignToMatchListSuccess, DeleteMatchListItem,
    DeleteMatchListItemSuccess,
    LoadMatchList,
    LoadMatchListSuccess,
    MatchListActionTypes, MoveMatchListItem, MoveMatchListItemSuccess
} from './matchlist.actions';
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

    describe('assignToMatchlist', () => {

        it('should return a AssignToMatchListSuccess', (done) => {
            const result = {}
            const expectedResult = new AssignToMatchListSuccess(result);
            spyOn(matchListService, 'assignToMatchList').and.returnValue(of(result));

            actions.next(new AssignToMatchList(null));

            matchListEffects.assignToMatchList$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a AssignToMatchListError', (done) => {
            spyOn(matchListService, 'assignToMatchList').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new AssignToMatchList(null));

            matchListEffects.assignToMatchList$.subscribe((result) => {
                expect(result.type).toEqual(MatchListActionTypes.AssignError);
                done();
            });
        });


    });

    describe('deleteMatchListItem', () => {

        it('should return a DeleteMatchListItemSuccess', (done) => {
            const result = {}
            const expectedResult = new DeleteMatchListItemSuccess(result);
            spyOn(matchListService, 'deleteMatchListItem').and.returnValue(of(result));

            actions.next(new DeleteMatchListItem('myId'));

            matchListEffects.deleteMatchListItem$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a DeleteMatchListItemError', (done) => {
            spyOn(matchListService, 'deleteMatchListItem').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new DeleteMatchListItem(null));

            matchListEffects.deleteMatchListItem$.subscribe((result) => {
                expect(result.type).toEqual(MatchListActionTypes.DeleteItemError);
                done();
            });
        });
    });

    describe('moveMatchListItem', () => {

        it('should return a MoveMatchListItemSuccess', (done) => {
            const result = {}
            const expectedResult = new MoveMatchListItemSuccess(result);
            spyOn(matchListService, 'moveMatchListItem').and.returnValue(of(result));

            actions.next(new MoveMatchListItem({}));

            matchListEffects.moveMatchListItem$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a MoveMatchListItemError', (done) => {
            spyOn(matchListService, 'moveMatchListItem').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new MoveMatchListItem(null));

            matchListEffects.moveMatchListItem$.subscribe((result) => {
                expect(result.type).toEqual(MatchListActionTypes.MoveItemError);
                done();
            });
        });
    });

});
