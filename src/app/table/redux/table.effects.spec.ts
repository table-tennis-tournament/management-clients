import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ToastrService} from 'ngx-toastr';
import {IndividualConfig} from 'ngx-toastr/toastr/toastr-config';
import {of, ReplaySubject, throwError} from 'rxjs';
import {MatchService} from '../../match/match.service';
import {TableService} from '../table.service';
import {LoadTables, LoadTablesError, LoadTablesSuccess, TableActionTypes} from './table.actions';
import {TableEffects} from './table.effects';

describe('the table effects', () => {
    let actions: ReplaySubject<any>;
    let tableEffects: TableEffects;
    let tableService: TableService;
    let responseTables = [
        {
            table:
            {
                id: 1,
                number: 1,
                isLocked: false
            },
            matchinfo: [
                {
                    id: 1,
                    team1: [
                        {}
                    ],
                    team2: [
                        {}
                    ]
                }
            ]},
    ];


    let toastServiceMock: ToastrService = <ToastrService>{
        error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null
    };

    beforeEach(() => {
        actions = new ReplaySubject<any>();
        TestBed.configureTestingModule({
            providers: [
                TableEffects,
                TableService,
                MatchService,
                {provide: ToastrService, useValue: toastServiceMock},
                HttpClient,
                HttpHandler,
                provideMockActions(() => actions)
            ]
        });

        tableEffects = TestBed.get(TableEffects);
        tableService = TestBed.get(TableService);
    });

    describe('loadTables', () => {

        it('should return a LoadTableSuccess', (done) => {
            let expectedResult = new LoadTablesSuccess(responseTables);
            spyOn(tableService, 'getAllTables').and.returnValue(of(responseTables));

            actions.next(new LoadTables(null));

            tableEffects.loadTables$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return a LoadTableError', (done) => {
            spyOn(tableService, 'getAllTables').and.returnValue(throwError({msg: 'Error'}));

            actions.next(new LoadTables(null));

            tableEffects.loadTables$.subscribe((result) => {
                expect(result.type).toEqual(TableActionTypes.LoadError);
                done();
            });
            // expect(toastServiceMock.error).toHaveBeenCalled();
        });


    });
});
