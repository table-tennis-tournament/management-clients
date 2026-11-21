import { Mock } from 'vitest';
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
  let toast: { error: Mock; success: Mock; info: Mock };

  const responseTables = [
    {
      id: 1,
      number: 1,
      isLocked: false,
      matches: [{ id: 1, team1: [{}], team2: [{}] }],
    },
  ];

  // what the backend answers to a successful command
  const statusDto: StatusDto = { success: true };

  const assign2ndTablePayload = { tableNr: 1, matchIds: [4, 5] };

  const resultForMatchPayload: TTMatchResult = {
    match: { id: 4 },
    result: [],
  };

  const assignMatchToTable: MatchToTable = { matchIds: [1, 2], tableNr: 1, tableId: 2 };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
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
      const load = vi.spyOn(tableService, 'getAllTables').mockReturnValue(of(responseTables));

      const result = await emittedBy(tableEffects.loadTables, actions, new LoadTables(null));

      expect(result).toStrictEqual([new LoadTablesSuccess(responseTables)]);
      expect(load.mock.calls).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadTablesError and show an error', async () => {
      vi.spyOn(tableService, 'getAllTables').mockReturnValue(throwError(() => error));

      const result = await emittedBy(tableEffects.loadTables, actions, new LoadTables(null));

      expect(result).toStrictEqual([new LoadTablesError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Tische', '']]);
    });
  });

  describe('assign second table', () => {
    it('should return a AssignToSecondTableSuccess', async () => {
      const assign = vi.spyOn(matchService, 'assignToSecondTable').mockReturnValue(of(statusDto));

      const result = await emittedBy(
        tableEffects.assignToSecondTable,
        actions,
        new AssignToSecondTable(assign2ndTablePayload)
      );

      expect(result).toStrictEqual([new AssignToSecondTableSuccess(assign2ndTablePayload)]);
      expect(assign.mock.calls).toEqual([[1, [4, 5]]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a AssignToSecondTableError and show an error', async () => {
      vi.spyOn(matchService, 'assignToSecondTable').mockReturnValue(throwError(() => error));

      const result = await emittedBy(
        tableEffects.assignToSecondTable,
        actions,
        new AssignToSecondTable(assign2ndTablePayload)
      );

      expect(result).toStrictEqual([new AssignToSecondTableError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim zuweisen des zweiten Tisches', '']]);
    });
  });

  describe('on result for match', () => {
    it('should return a ResultForMatchSuccess', async () => {
      const enter = vi.spyOn(matchService, 'resultForMatch').mockReturnValue(of(statusDto));

      const result = await emittedBy(tableEffects.resultForMatch, actions, new ResultForMatch(resultForMatchPayload));

      expect(result).toStrictEqual([new ResultForMatchSuccess(resultForMatchPayload)]);
      expect(enter.mock.calls).toEqual([[resultForMatchPayload]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a ResultForMatchError and show an error', async () => {
      vi.spyOn(matchService, 'resultForMatch').mockReturnValue(throwError(() => error));

      const result = await emittedBy(tableEffects.resultForMatch, actions, new ResultForMatch(resultForMatchPayload));

      expect(result).toStrictEqual([new ResultForMatchError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler bei der Eingabe des Ergebnisses', '']]);
    });
  });

  describe('on assign match to table', () => {
    // regression: admin-view read `successful`, so the backend's `{"success": true}` was treated as a failure
    it('should return a AssignMatchToTableSuccess for the backend answer {"success": true}', async () => {
      const assign = vi.spyOn(matchService, 'assignMatchToTable').mockReturnValue(of(statusDto));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toStrictEqual([new AssignMatchToTableSuccess(assignMatchToTable)]);
      expect(assign.mock.calls).toEqual([[assignMatchToTable]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a AssignMatchToTableError with the default message when the request fails', async () => {
      vi.spyOn(matchService, 'assignMatchToTable').mockReturnValue(throwError(() => error));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toStrictEqual([new AssignMatchToTableError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Zuweisen des Spiels zum Tisch', '']]);
    });

    it('should show the backend message when the request fails with one', async () => {
      const backendError = { error: { success: false, message: 'Could not assign all matches to table.' } };
      vi.spyOn(matchService, 'assignMatchToTable').mockReturnValue(throwError(() => backendError));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toStrictEqual([new AssignMatchToTableError(backendError)]);
      expect(toast.error.mock.calls).toEqual([['Could not assign all matches to table.', '']]);
    });

    it('should return a AssignMatchToTableError when the status is not successful', async () => {
      const failedStatus: StatusDto = { success: false, message: 'Tisch belegt' };

      vi.spyOn(matchService, 'assignMatchToTable').mockReturnValue(of(failedStatus));

      const result = await emittedBy(
        tableEffects.assignMatchToTable,
        actions,
        new AssignMatchToTable(assignMatchToTable)
      );

      expect(result).toStrictEqual([new AssignMatchToTableError(failedStatus)]);
      expect(toast.error.mock.calls).toEqual([['Tisch belegt']]);
    });
  });
});
