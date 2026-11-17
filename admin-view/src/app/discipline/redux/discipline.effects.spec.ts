import { Mock } from 'vitest';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { of, ReplaySubject, throwError } from 'rxjs';
import { emittedBy } from '../../testing/effects-testing';
import { DisciplineService } from '../discipline.service';
import { LoadDiscipline, LoadDisciplineError, LoadDisciplineSuccess } from './discipline.actions';
import { DisciplineEffects } from './discipline.effects';
import { DisciplineTestData } from './test-data';

describe('the Discipline effects', () => {
  const error = { msg: 'Error' };
  let actions: ReplaySubject<any>;
  let disciplineEffects: DisciplineEffects;
  let disciplineService: DisciplineService;
  let toast: { error: Mock; success: Mock; info: Mock };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        DisciplineEffects,
        DisciplineService,
        { provide: ToastrService, useValue: toast },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });

    disciplineEffects = TestBed.inject(DisciplineEffects);
    disciplineService = TestBed.inject(DisciplineService);
  });

  describe('loadDisciplines', () => {
    it('should return a LoadDisciplineSuccess', async () => {
      const load = vi.spyOn(disciplineService, 'loadAllDisciplines').mockReturnValue(of(DisciplineTestData));

      const result = await emittedBy(disciplineEffects.loadDisciplines, actions, new LoadDiscipline(null));

      expect(result).toStrictEqual([new LoadDisciplineSuccess(DisciplineTestData)]);
      expect(load.mock.calls).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadDisciplineError and show an error', async () => {
      vi.spyOn(disciplineService, 'loadAllDisciplines').mockReturnValue(throwError(() => error));

      const result = await emittedBy(disciplineEffects.loadDisciplines, actions, new LoadDiscipline(null));

      expect(result).toStrictEqual([new LoadDisciplineError(error)]);
      expect(toast.error.mock.calls).toEqual([['Fehler beim Laden der Konkurrenzen']]);
    });
  });
});
