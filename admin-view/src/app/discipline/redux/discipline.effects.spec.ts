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
  let toast: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    toast = jasmine.createSpyObj('ToastrService', ['error', 'success', 'info']);
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
      const load = spyOn(disciplineService, 'loadAllDisciplines').and.returnValue(of(DisciplineTestData));

      const result = await emittedBy(disciplineEffects.loadDisciplines, actions, new LoadDiscipline(null));

      expect(result).toEqual([new LoadDisciplineSuccess(DisciplineTestData)]);
      expect(load.calls.allArgs()).toEqual([[]]);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return a LoadDisciplineError and show an error', async () => {
      spyOn(disciplineService, 'loadAllDisciplines').and.returnValue(throwError(() => error));

      const result = await emittedBy(disciplineEffects.loadDisciplines, actions, new LoadDiscipline(null));

      expect(result).toEqual([new LoadDisciplineError(error)]);
      expect(toast.error.calls.allArgs()).toEqual([['Fehler beim Laden der Konkurrenzen']]);
    });
  });
});
