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
  const status: StatusDto = { message: 'ok' }; // passed through unchanged
  let actions: ReplaySubject<any>;
  let matchListEffects: MatchListEffects;
  let matchListService: MatchListService;
  let toast: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = jasmine.createSpyObj('ToastrService', ['error', 'success', 'info']);
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
      const load = spyOn(matchListService, 'loadAllMatchListItems').and.returnValue(of(testData));

      const result = await emittedBy(matchListEffects.loadMatchList, actions, new LoadMatchList(null));

      expect(result).toEqual([new LoadMatchListSuccess(testData)]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadMatchListError and show an error', async () => {
      spyOn(matchListService, 'loadAllMatchListItems').and.returnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.loadMatchList, actions, new LoadMatchList(null));

      expect(result).toEqual([new LoadMatchListError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der MatchList']]);
    });
  });

  describe('assignToMatchlist', () => {
    const request = { matchIds: [1, 2], group: 7, position: 0 };

    it('should return a AssignToMatchListSuccess and confirm it', async () => {
      const assign = spyOn(matchListService, 'assignToMatchList').and.returnValue(of(status));

      const result = await emittedBy(matchListEffects.assignToMatchList, actions, new AssignToMatchList(request));

      expect(result).toEqual([new AssignToMatchListSuccess(status)]);
      expect(assign.calls.allArgs()).toEqual([[request]]);
      expect(toast.info.calls.allArgs()).toEqual([['In Warteliste eingefügt']]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a AssignToMatchListError and show an error', async () => {
      spyOn(matchListService, 'assignToMatchList').and.returnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.assignToMatchList, actions, new AssignToMatchList(request));

      expect(result).toEqual([new AssignToMatchListError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Hinzufügen des Matchlist-items']]);
      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('deleteMatchListItem', () => {
    it('should return a DeleteMatchListItemSuccess', async () => {
      const remove = spyOn(matchListService, 'deleteMatchListItem').and.returnValue(of(status));

      const result = await emittedBy(matchListEffects.deleteMatchListItem, actions, new DeleteMatchListItem('myId'));

      expect(result).toEqual([new DeleteMatchListItemSuccess(status)]);
      expect(remove.calls.allArgs()).toEqual([['myId']]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a DeleteMatchListItemError and show an error', async () => {
      spyOn(matchListService, 'deleteMatchListItem').and.returnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.deleteMatchListItem, actions, new DeleteMatchListItem('myId'));

      expect(result).toEqual([new DeleteMatchListItemError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Löschen des Matchlist-items']]);
    });
  });

  describe('moveMatchListItem', () => {
    const move = { id: 'myId', position: 3 };

    it('should return a MoveMatchListItemSuccess', async () => {
      const moveItem = spyOn(matchListService, 'moveMatchListItem').and.returnValue(of(status));

      const result = await emittedBy(matchListEffects.moveMatchListItem, actions, new MoveMatchListItem(move));

      expect(result).toEqual([new MoveMatchListItemSuccess(status)]);
      expect(moveItem.calls.allArgs()).toEqual([[move]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a MoveMatchListItemError and show an error', async () => {
      spyOn(matchListService, 'moveMatchListItem').and.returnValue(throwError(() => error));

      const result = await emittedBy(matchListEffects.moveMatchListItem, actions, new MoveMatchListItem(move));

      expect(result).toEqual([new MoveMatchListItemError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Verschieben des Matchlist-items']]);
    });
  });
});
