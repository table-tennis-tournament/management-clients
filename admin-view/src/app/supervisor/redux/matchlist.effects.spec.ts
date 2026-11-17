import { Mock } from 'vitest';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { of, ReplaySubject, throwError } from 'rxjs';
import { emittedBy } from '../../testing/effects-testing';
import { StatusDto } from '../../shared/statusdto.model';
import { MatchListEffects } from './matchlist.effects';
import {
  AssignToMatchList,
  AssignToMatchListError,
  AssignToMatchListSuccess,
  DeleteMatchListItem,
  DeleteMatchListItemError,
  DeleteMatchListItemSuccess,
  LoadMatchList,
  LoadMatchListError,
  LoadMatchListSuccess,
  MoveMatchListItem,
  MoveMatchListItemError,
  MoveMatchListItemSuccess,
} from './matchlist.actions';
import { testData } from './test.data';
import { MatchListService } from '../matchlist.service';

describe('the matchlist effects', () => {
  const error = { msg: 'Error' };
  const status: StatusDto = { success: true };
  let actions: ReplaySubject<any>;
  let matchListEffects: MatchListEffects;
  let matchListService: MatchListService;
  let toast: { error: Mock; success: Mock; info: Mock };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        MatchListEffects,
        MatchListService,
        { provide: ToastrService, useValue: toast },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });
    matchListService = TestBed.inject(MatchListService);
    matchListEffects = TestBed.inject(MatchListEffects);
  });

  describe('loadMatchlist', () => {
    it('should return a LoadMatchListSuccess', async () => {
      const load = vi.spyOn(matchListService, 'loadAllMatchListItems').mockReturnValue(of(testData));

      const result = await emittedBy(matchListEffects.loadMatchList, actions, new LoadMatchList(null));

      expect(result).toStrictEqual([new LoadMatchListSuccess(testData)]);
      expect(load.mock.calls).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadMatchListError and show an error', async () => {
      vi.spyOn(matchListService, 'loadAllMatchListItems').mockReturnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.loadMatchList, actions, new LoadMatchList(null));

      expect(result).toStrictEqual([new LoadMatchListError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der MatchList']]);
    });
  });

  describe('assignToMatchlist', () => {
    const request = { matchIds: [1, 2], group: 7, position: 0 };

    it('should return a AssignToMatchListSuccess and confirm it', async () => {
      const assign = vi.spyOn(matchListService, 'assignToMatchList').mockReturnValue(of(status));

      const result = await emittedBy(matchListEffects.assignToMatchList, actions, new AssignToMatchList(request));

      expect(result).toStrictEqual([new AssignToMatchListSuccess(status)]);
      expect(assign.mock.calls).toEqual([[request]]);
      expect(toast.info.mock.calls).toEqual([['In Warteliste eingefügt']]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a AssignToMatchListError and show an error', async () => {
      vi.spyOn(matchListService, 'assignToMatchList').mockReturnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.assignToMatchList, actions, new AssignToMatchList(request));

      expect(result).toStrictEqual([new AssignToMatchListError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Hinzufügen des Matchlist-items']]);
      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('deleteMatchListItem', () => {
    it('should return a DeleteMatchListItemSuccess', async () => {
      const remove = vi.spyOn(matchListService, 'deleteMatchListItem').mockReturnValue(of(status));

      const result = await emittedBy(matchListEffects.deleteMatchListItem, actions, new DeleteMatchListItem('myId'));

      expect(result).toStrictEqual([new DeleteMatchListItemSuccess(status)]);
      expect(remove.mock.calls).toEqual([['myId']]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a DeleteMatchListItemError and show an error', async () => {
      vi.spyOn(matchListService, 'deleteMatchListItem').mockReturnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.deleteMatchListItem, actions, new DeleteMatchListItem('myId'));

      expect(result).toStrictEqual([new DeleteMatchListItemError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Löschen des Matchlist-items']]);
    });
  });

  describe('moveMatchListItem', () => {
    const move = { id: 'myId', position: 3 };

    it('should return a MoveMatchListItemSuccess', async () => {
      const moveItem = vi.spyOn(matchListService, 'moveMatchListItem').mockReturnValue(of(status));

      const result = await emittedBy(matchListEffects.moveMatchListItem, actions, new MoveMatchListItem(move));

      expect(result).toStrictEqual([new MoveMatchListItemSuccess(status)]);
      expect(moveItem.mock.calls).toEqual([[move]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a MoveMatchListItemError and show an error', async () => {
      vi.spyOn(matchListService, 'moveMatchListItem').mockReturnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.moveMatchListItem, actions, new MoveMatchListItem(move));

      expect(result).toStrictEqual([new MoveMatchListItemError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Verschieben des Matchlist-items']]);
    });
  });
});
