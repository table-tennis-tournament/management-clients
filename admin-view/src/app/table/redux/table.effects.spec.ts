import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { IndividualConfig } from 'ngx-toastr/toastr/toastr-config';
import { of, ReplaySubject, throwError } from 'rxjs';
import { MatchService } from '../../assign/match.service';
import { TableService } from '../table.service';
import {
  AssignMatchToTable,
  AssignMatchToTableError,
  AssignMatchToTableSuccess,
  AssignToSecondTable,
  AssignToSecondTableSuccess,
  LoadTables,
  LoadTablesSuccess,
  ResultForMatch,
  ResultForMatchSuccess,
  TableActionTypes,
} from './table.actions';
import { TableEffects } from './table.effects';
import { TTMatchResult } from '../table-list/result-modal/ttmatch-result.model';
import { MatchToTable } from '../table-list/tt-table/tt-table-content/matchtotable.model';
import { StatusDto } from '../../shared/statusdto.model';

describe('the table effects', () => {
  let actions: ReplaySubject<any>;
  let tableEffects: TableEffects;
  let tableService: TableService;
  let matchService: MatchService;
  const responseTables = [
    {
      id: 1,
      number: 1,
      isLocked: false,
      matches: [
        {
          id: 1,
          team1: [{}],
          team2: [{}],
        },
      ],
    },
  ];

  const statusDto = {
    message: 'success',
    successful: true,
  };

  const assign2ndTablePayload = {
    tableNr: 1,
    matchIds: [],
  };

  const resultForMatchPayload: TTMatchResult = {
    match: {},
    result: [],
  };

  const toastServiceMock: ToastrService = <ToastrService>{
    error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null,
  };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    TestBed.configureTestingModule({
      providers: [
        TableEffects,
        TableService,
        MatchService,
        { provide: ToastrService, useValue: toastServiceMock },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });

    tableEffects = TestBed.get(TableEffects);
    tableService = TestBed.get(TableService);
    matchService = TestBed.get(MatchService);
  });

  describe('loadTables', () => {
    it('should return a LoadTableSuccess', (done) => {
      const expectedResult = new LoadTablesSuccess(responseTables);
      spyOn(tableService, 'getAllTables').and.returnValue(of(responseTables));

      actions.next(new LoadTables(null));

      tableEffects.loadTables$.subscribe((result) => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });

    it('should return a LoadTableError', (done) => {
      spyOn(tableService, 'getAllTables').and.returnValue(throwError({ msg: 'Error' }));

      actions.next(new LoadTables(null));

      tableEffects.loadTables$.subscribe((result) => {
        expect(result.type).toEqual(TableActionTypes.LoadError);
        done();
      });
      // expect(toastServiceMock.error).toHaveBeenCalled();
    });
  });

  describe('assign second table', () => {
    it('should return a AssignToSecondTableSuccess', (done) => {
      const expectedResult = new AssignToSecondTableSuccess(assign2ndTablePayload);
      spyOn(matchService, 'assignToSecondTable').and.returnValue(of(statusDto));

      actions.next(new AssignToSecondTable(assign2ndTablePayload));

      tableEffects.assignToSecondTable$.subscribe((result) => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });

    it('should return a AssignToSecondTableError', (done) => {
      spyOn(matchService, 'assignToSecondTable').and.returnValue(throwError({ msg: 'Error' }));

      actions.next(new AssignToSecondTable(assign2ndTablePayload));

      tableEffects.assignToSecondTable$.subscribe((result) => {
        expect(result.type).toEqual(TableActionTypes.AssignToSecondTableError);
        done();
      });
      // expect(toastServiceMock.error).toHaveBeenCalled();
    });
  });

  describe('on result for table', () => {
    it('should return a ResultForTableSuccess', (done) => {
      const expectedResult = new ResultForMatchSuccess(resultForMatchPayload);
      spyOn(matchService, 'resultForMatch').and.returnValue(of(statusDto));

      actions.next(new ResultForMatch(resultForMatchPayload));

      tableEffects.resultForMatch$.subscribe((result) => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });

    it('should return a ResultForTableError', (done) => {
      spyOn(matchService, 'resultForMatch').and.returnValue(throwError({ msg: 'Error' }));

      actions.next(new ResultForMatch(resultForMatchPayload));

      tableEffects.resultForMatch$.subscribe((result) => {
        expect(result.type).toEqual(TableActionTypes.ResultForMatchError);
        done();
      });
      // expect(toastServiceMock.error).toHaveBeenCalled();
    });
  });

  describe('on assign match to table', () => {
    it('should return a AssignMatchToTableSuccess', (done) => {
      const assignMatchToTable: MatchToTable = {
        matchIds: [1, 2],
        tableNr: 1,
        tableId: 2,
      };
      const expectedResult = new AssignMatchToTableSuccess(assignMatchToTable);
      spyOn(matchService, 'assignMatchToTable').and.returnValue(of(statusDto));

      actions.next(new AssignMatchToTable(assignMatchToTable));

      tableEffects.assignMatchToTable$.subscribe((result) => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });

    it('should return a AssignMatchToTableError', (done) => {
      spyOn(matchService, 'assignMatchToTable').and.returnValue(throwError({ msg: 'Error' }));

      actions.next(new AssignMatchToTable({}));

      tableEffects.assignMatchToTable$.subscribe((result) => {
        expect(result.type).toEqual(TableActionTypes.AssignMatchToTableError);
        done();
      });
    });

    it('should return a AssignMatchToTableError', (done) => {
      const failedStatus: StatusDto = { successful: false };
      const expectedResult = new AssignMatchToTableError(failedStatus);
      spyOn(matchService, 'assignMatchToTable').and.returnValue(of(failedStatus));

      actions.next(new AssignMatchToTable({}));

      tableEffects.assignMatchToTable$.subscribe((result) => {
        console.log(result);
        expect(result).toEqual(expectedResult);
        done();
      });
    });
  });
});
