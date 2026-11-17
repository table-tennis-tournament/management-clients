import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { of, ReplaySubject, throwError } from 'rxjs';
import { emittedBy } from '../../testing/effects-testing';
import { MatchService } from '../../assign/match.service';
import { TableService } from '../table.service';
import {
  AssignMatchToTable,
  AssignMatchToTableError,
  AssignMatchToTableSuccess,
  AssignToSecondTable,
  AssignToSecondTableError,
  AssignToSecondTableSuccess,
  LoadTables,
  LoadTablesError,
  LoadTablesSuccess,
  ResultForMatch,
  ResultForMatchError,
  ResultForMatchSuccess,
} from './table.actions';
import { TableEffects } from './table.effects';
import { TTMatchResult } from '../table-list/result-modal/ttmatch-result.model';
import { MatchToTable } from '../table-list/tt-table/tt-table-content/matchtotable.model';
import { StatusDto } from '../../shared/statusdto.model';

describe('the table effects', () => {
  const error = { msg: 'Error' };
  let actions: ReplaySubject<any>;
  let tableEffects: TableEffects;
  let tableService: TableService;
  let matchService: MatchService;
  let toast: jasmine.SpyObj<ToastrService>;

  const responseTables = [
    {
      id: 1,
      number: 1,
      isLocked: false,
      matches: [{ id: 1, team1: [{}], team2: [{}] }],
    },
  ];

  // The shape StatusDto declares. The backend sends `success`, not `successful` (test-improvement-plan finding 10).
  const statusDto: StatusDto = { message: 'success', successful: true };

  const assign2ndTablePayload = { tableNr: 1, matchIds: [4, 5] };

  const resultForMatchPayload: TTMatchResult = {
    match: { id: 4 },
    result: [],
  };

  const assignMatchToTable: MatchToTable = { matchIds: [1, 2], tableNr: 1, tableId: 2 };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = jasmine.createSpyObj('ToastrService', ['error', 'success', 'info']);
    TestBed.configureTestingModule({
      providers: [
        TableEffects,
        TableService,
        MatchService,
        { provide: ToastrService, useValue: toast },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });

    tableEffects = TestBed.inject(TableEffects);
    tableService = TestBed.inject(TableService);
    matchService = TestBed.inject(MatchService);
  });

  describe('loadTables', () => {
    it('should return a LoadTablesSuccess', async () => {
      const load = spyOn(tableService, 'getAllTables').and.returnValue(of(responseTables));

      const result = await emittedBy(tableEffects.loadTables, actions, new LoadTables(null));

      expect(result).toEqual([new LoadTablesSuccess(responseTables)]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadTablesError and show an error', async () => {
      spyOn(tableService, 'getAllTables').and.returnValue(throwError(() => error));

      const result = await emittedBy(tableEffects.loadTables, actions, new LoadTables(null));

      expect(result).toEqual([new LoadTablesError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der Tische', '']]);
    });
  });

  describe('assign second table', () => {
    it('should return a AssignToSecondTableSuccess', async () => {
      const assign = spyOn(matchService, 'assignToSecondTable').and.returnValue(of(statusDto));

      const result = await emittedBy(
        tableEffects.assignToSecondTable,
        actions,
        new AssignToSecondTable(assign2ndTablePayload)
      );

      expect(result).toEqual([new AssignToSecondTableSuccess(assign2ndTablePayload)]);
      expect(assign.calls.allArgs()).toEqual([[1, [4, 5]]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a AssignToSecondTableError and show an error', async () => {
      spyOn(matchService, 'assignToSecondTable').and.returnValue(throwError(() => error));

      const result = await emittedBy(
        tableEffects.assignToSecondTable,
        actions,
        new AssignToSecondTable(assign2ndTablePayload)
      );

      expect(result).toEqual([new AssignToSecondTableError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim zuweisen des zweiten Tisches', '']]);
    });
  });

  describe('on result for match', () => {
    it('should return a ResultForMatchSuccess', async () => {
      const enter = spyOn(matchService, 'resultForMatch').and.returnValue(of(statusDto));

      const result = await emittedBy(tableEffects.resultForMatch, actions, new ResultForMatch(resultForMatchPayload));

      expect(result).toEqual([new ResultForMatchSuccess(resultForMatchPayload)]);
      expect(enter.calls.allArgs()).toEqual([[resultForMatchPayload]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a ResultForMatchError and show an error', async () => {
      spyOn(matchService, 'resultForMatch').and.returnValue(throwError(() => error));

      const result = await emittedBy(tableEffects.resultForMatch, actions, new ResultForMatch(resultForMatchPayload));

      expect(result).toEqual([new ResultForMatchError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler bei der Eingabe des Ergebnisses', '']]);
    });
  });

  describe('on assign match to table', () => {
    it('should return a AssignMatchToTableSuccess', async () => {
      const assign = spyOn(matchService, 'assignMatchToTable').and.returnValue(of(statusDto));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toEqual([new AssignMatchToTableSuccess(assignMatchToTable)]);
      expect(assign.calls.allArgs()).toEqual([[assignMatchToTable]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a AssignMatchToTableError with the default message when the request fails', async () => {
      spyOn(matchService, 'assignMatchToTable').and.returnValue(throwError(() => error));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toEqual([new AssignMatchToTableError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Zuweisen des Spiels zum Tisch', '']]);
    });

    it('should show the backend message when the request fails with one', async () => {
      const backendError = { error: { success: false, message: 'Could not assign all matches to table.' } };
      spyOn(matchService, 'assignMatchToTable').and.returnValue(throwError(() => backendError));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toEqual([new AssignMatchToTableError(backendError)]);
      expect(toast.error.calls.allArgs()).toEqual([['Could not assign all matches to table.', '']]);
    });

    it('should return a AssignMatchToTableError when the status is not successful', async () => {
      const failedStatus: StatusDto = { successful: false, message: 'Tisch belegt' };

      spyOn(matchService, 'assignMatchToTable').and.returnValue(of(failedStatus));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toEqual([new AssignMatchToTableError(failedStatus)]);
      expect(toast.error.calls.allArgs()).toEqual([['Tisch belegt']]);
    });
  });
});
