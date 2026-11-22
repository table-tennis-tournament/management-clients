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
  FreeTable,
  FreeTableError,
  FreeTableSuccess,
  LoadTables,
  LoadTablesError,
  LoadTablesSuccess,
  LockTable,
  LockTableError,
  LockTableSuccess,
  PrintTable,
  PrintTableError,
  PrintTableSuccess,
  RemoveMatchFromTable,
  RemoveMatchFromTableError,
  RemoveMatchFromTableSuccess,
  ResultForMatch,
  ResultForMatchError,
  ResultForMatchSuccess,
  TakeBackTable,
  TakeBackTableError,
  TakeBackTableSuccess,
  UnLockTable,
  UnLockTableError,
  UnLockTableSuccess,
} from './table.actions';
import { PrintService } from '../../shared/print.service';
import { LoadMatches } from '../../assign/redux/match.actions';
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
  let printService: PrintService;
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
    printService = TestBed.inject(PrintService);
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

  describe('locking and unlocking a table by its number', () => {
    it('should return a LockTableSuccess', async () => {
      const lock = vi.spyOn(tableService, 'lockTable').mockReturnValue(of(statusDto));

      expect(await emittedBy(tableEffects.lockTables, actions, new LockTable(7))).toStrictEqual([
        new LockTableSuccess(7),
      ]);
      expect(lock.mock.calls).toEqual([[7]]);
    });

    it('should return a LockTableError and show an error', async () => {
      vi.spyOn(tableService, 'lockTable').mockReturnValue(throwError(() => error));

      expect(await emittedBy(tableEffects.lockTables, actions, new LockTable(7))).toStrictEqual([
        new LockTableError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Sperren des Tisches', '']]);
    });

    it('should return an UnLockTableSuccess', async () => {
      const unlock = vi.spyOn(tableService, 'unLockTable').mockReturnValue(of(statusDto));

      expect(await emittedBy(tableEffects.unLockTables, actions, new UnLockTable(7))).toStrictEqual([
        new UnLockTableSuccess(7),
      ]);
      expect(unlock.mock.calls).toEqual([[7]]);
    });

    it('should return an UnLockTableError and show an error', async () => {
      vi.spyOn(tableService, 'unLockTable').mockReturnValue(throwError(() => error));

      expect(await emittedBy(tableEffects.unLockTables, actions, new UnLockTable(7))).toStrictEqual([
        new UnLockTableError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Entsperren des Tisches', '']]);
    });
  });

  describe('freeing a table', () => {
    const payload = { matchIds: [4, 5] };

    it('should free its matches, confirm it and return a FreeTableSuccess', async () => {
      const free = vi.spyOn(matchService, 'freeMatches').mockReturnValue(of(statusDto));

      expect(await emittedBy(tableEffects.freeTables, actions, new FreeTable(payload))).toStrictEqual([
        new FreeTableSuccess(payload),
      ]);
      expect(free.mock.calls).toEqual([[[4, 5]]]);
      expect(toast.success.mock.calls).toEqual([['SpielNr. 4,5 frei gemacht']]);
    });

    it('should return a FreeTableError and show an error', async () => {
      vi.spyOn(matchService, 'freeMatches').mockReturnValue(throwError(() => error));

      expect(await emittedBy(tableEffects.freeTables, actions, new FreeTable(payload))).toStrictEqual([
        new FreeTableError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Freigeben des Tisches', '']]);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('taking back the matches of a table', () => {
    const payload = { matchIds: [4] };

    it('should return a TakeBackTableSuccess', async () => {
      const takeBack = vi.spyOn(matchService, 'takeBackMatches').mockReturnValue(of(statusDto));

      expect(await emittedBy(tableEffects.takeBackTables, actions, new TakeBackTable(payload))).toStrictEqual([
        new TakeBackTableSuccess(payload),
      ]);
      expect(takeBack.mock.calls).toEqual([[[4]]]);
    });

    it('should return a TakeBackTableError and show an error', async () => {
      vi.spyOn(matchService, 'takeBackMatches').mockReturnValue(throwError(() => error));

      expect(await emittedBy(tableEffects.takeBackTables, actions, new TakeBackTable(payload))).toStrictEqual([
        new TakeBackTableError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Zurücknehmen der Spiele', '']]);
    });
  });

  describe('printing the match of a table', () => {
    const payload = { matchId: 4 };

    it('should return a PrintTableSuccess', async () => {
      const print = vi.spyOn(printService, 'printMatch').mockReturnValue(of(statusDto));

      expect(await emittedBy(tableEffects.printTables, actions, new PrintTable(payload))).toStrictEqual([
        new PrintTableSuccess(payload),
      ]);
      expect(print.mock.calls).toEqual([[4]]);
    });

    it('should return a PrintTableError and show an error', async () => {
      vi.spyOn(printService, 'printMatch').mockReturnValue(throwError(() => error));

      expect(await emittedBy(tableEffects.printTables, actions, new PrintTable(payload))).toStrictEqual([
        new PrintTableError(error),
      ]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Drucken des Spiels', '']]);
    });
  });

  describe('removing a match from one of its two tables', () => {
    const payload = { tableId: 2, matchIds: [4] };

    it('should return a RemoveMatchFromTableSuccess', async () => {
      const remove = vi.spyOn(matchService, 'removeMatchFromTable').mockReturnValue(of(statusDto));

      expect(
        await emittedBy(tableEffects.removeMatchFromTable, actions, new RemoveMatchFromTable(payload))
      ).toStrictEqual([new RemoveMatchFromTableSuccess(payload)]);
      expect(remove.mock.calls).toEqual([[payload]]);
    });

    it('should return a RemoveMatchFromTableError and show an error', async () => {
      vi.spyOn(matchService, 'removeMatchFromTable').mockReturnValue(throwError(() => error));

      expect(
        await emittedBy(tableEffects.removeMatchFromTable, actions, new RemoveMatchFromTable(payload))
      ).toStrictEqual([new RemoveMatchFromTableError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Entfernen der Spiele', '']]);
    });

    it('should reload the tables and the matches once it is removed, without waiting for the update event', async () => {
      expect(
        await emittedBy(tableEffects.reloadAfterRemoveMatchFromTable, actions, new RemoveMatchFromTableSuccess(payload))
      ).toStrictEqual([new LoadTables(null), new LoadMatches(null)]);
    });
  });
});
