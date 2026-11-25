import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NotificationService } from '../shared/notification.service';
import { of, Subject } from 'rxjs';
import { Match } from '../shared/data/match.model';
import { TableListPageComponent } from './table-list.page.component';
import { TableService } from './table.service';
import { TableDto } from './tabledto.model';
import { TableMatchEvent } from './redux/table.match.event';
import {
  AssignMatchToTable,
  AssignToSecondTable,
  FreeTable,
  LoadTables,
  LockTable,
  PrintTable,
  RemoveMatchFromTable,
  ResultForMatch,
  TakeBackTable,
  UnLockTable,
} from './redux/table.actions';
import { ResultModalComponent } from './table-list/result-modal/result-modal.component';
import { SelectMatchModalComponent } from './table-list/select-match-modal/select-match-modal.component';
import { SelectTableModalComponent } from './table-list/select-table-modal/select-table-modal.component';

describe('the tables page', () => {
  let page: TableListPageComponent;
  let dispatched: unknown[];
  let notifications: { error: ReturnType<typeof vi.fn> };
  let dialogClosed: Subject<unknown>;
  let dialog: { open: ReturnType<typeof vi.fn> };
  let freeTables: TableDto[];

  const match = (id: number, groupId = 1, players = [id, id + 10], secondTableId?: number): Match =>
    ({
      id,
      playGroup: { id: groupId, name: 'A' },
      team1: [{ id: players[0] }],
      team2: [{ id: players[1] }],
      secondTableId,
    }) as Match;
  const table = (...matches: Match[]): TableDto => ({ id: 30, number: 3, isLocked: false, matches }) as TableDto;

  beforeEach(() => {
    dispatched = [];
    notifications = { error: vi.fn() };
    dialogClosed = new Subject();
    dialog = { open: vi.fn(() => ({ afterClosed: () => dialogClosed })) };
    freeTables = [{ id: 50, number: 5, isLocked: false, matches: [] } as TableDto];
    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: { dispatch: (action: unknown) => dispatched.push(action), select: vi.fn() } },
        { provide: TableService, useValue: { getFreeTables: () => of(freeTables) } },
        { provide: NotificationService, useValue: notifications },
        { provide: MatDialog, useValue: dialog },
      ],
    });
    page = TestBed.runInInjectionContext(() => new TableListPageComponent());
  });

  it('locks, unlocks and reloads the tables, and assigns a dropped match', () => {
    page.onLockTable(3);
    page.onUnLockTable(3);
    page.onTableRefresh();
    page.onAssignMatchToTable({ matchIds: [1], tableId: 30, tableNr: 3 });

    expect(dispatched).toEqual([
      new LockTable(3),
      new UnLockTable(3),
      new LoadTables(null),
      new AssignMatchToTable({ matchIds: [1], tableId: 30, tableNr: 3 }),
    ]);
  });

  describe('freeing and taking back', () => {
    it('frees the only match of a table without asking', () => {
      page.onFreeTable(table(match(1)));

      expect(dispatched).toEqual([new FreeTable(new TableMatchEvent([1], 30))]);
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('asks which matches to take back when a table has several', () => {
      const matches = [match(1), match(2)];
      page.onTakeBackTable(table(...matches));

      expect(dialog.open.mock.calls).toEqual([[SelectMatchModalComponent, { width: '400px', data: matches }]]);
      dialogClosed.next([matches[1]]);
      expect(dispatched).toEqual([new TakeBackTable(new TableMatchEvent([2], 30))]);
    });

    it('does nothing when the choice is cancelled or empty', () => {
      page.onTakeBackTable(table(match(1), match(2)));
      dialogClosed.next(undefined);
      dialogClosed.next([]);

      expect(dispatched).toEqual([]);
    });

    it('takes only the matches waiting at two tables off this table ("Entfernen")', () => {
      page.onRemoveFromTable(table(match(1), match(2, 1, [2, 12], 40)));

      expect(dispatched).toEqual([new RemoveMatchFromTable(new TableMatchEvent([2], 30))]);
    });
  });

  it('prints the match of a table with one match, and nothing for several', () => {
    page.onPrintTable(table(match(1)));
    page.onPrintTable(table(match(1), match(2)));

    expect(dispatched).toEqual([new PrintTable({ matchId: 1 })]);
  });

  describe('entering a result', () => {
    it('opens the result dialog, kampflos only where the page allows it, and saves the entered result', () => {
      const single = match(1);
      page.kampflosEntry = true;
      page.onResultForTable(table(single));

      expect(dialog.open.mock.calls).toEqual([
        [ResultModalComponent, { width: '500px', data: { match: single, kampflosAllowed: true } }],
      ]);
      const result = { match: single, result: [], kampflos: false };
      dialogClosed.next(result);
      expect(dispatched).toEqual([new ResultForMatch(result)]);
    });

    it('saves nothing when the dialog is cancelled', () => {
      page.onResultForTable(table(match(1)));
      dialogClosed.next(undefined);

      expect(dispatched).toEqual([]);
    });

    it('refuses a result for a table with several matches', () => {
      page.onResultForTable(table(match(1), match(2)));

      expect(dialog.open).not.toHaveBeenCalled();
      expect(notifications.error.mock.calls).toEqual([['Ergebnis für zwei Tische kann nicht eingegeben werden.']]);
    });
  });

  describe('a second table ("2.Tisch")', () => {
    const groupOfFour = () => table(match(1, 1, [1, 2]), match(2, 1, [3, 4]));

    it('lets the group choose a free table and puts its matches there as well', () => {
      page.onAssignSecondTable(groupOfFour());

      expect(dialog.open.mock.calls).toEqual([[SelectTableModalComponent, { width: '250px', data: freeTables }]]);
      dialogClosed.next(5);
      expect(dispatched).toEqual([new AssignToSecondTable({ tableNr: 5, matchIds: [1, 2] })]);
    });

    it('does nothing when no table is chosen', () => {
      page.onAssignSecondTable(groupOfFour());
      dialogClosed.next(undefined);

      expect(dispatched).toEqual([]);
    });

    it('refuses a table that is not one group of at least four players', () => {
      page.onAssignSecondTable(table(match(1, 1, [1, 2]), match(2, 1, [1, 3])));

      expect(dialog.open).not.toHaveBeenCalled();
      expect(notifications.error.mock.calls).toEqual([
        ['Nur eine Gruppe mit mindestens vier Spielern kann an zwei Tischen spielen.'],
      ]);
    });

    it('tells when no table is free', () => {
      freeTables = [];
      page.onAssignSecondTable(groupOfFour());

      expect(dialog.open).not.toHaveBeenCalled();
      expect(notifications.error.mock.calls).toEqual([['Es sind keine freien Tische verfügbar.']]);
    });
  });
});
