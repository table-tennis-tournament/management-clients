import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { IndividualConfig } from 'ngx-toastr/toastr/toastr-config';
import { of, ReplaySubject, throwError } from 'rxjs';

import { DisciplineService } from '../discipline.service';
import { DisciplineActionTypes, LoadDiscipline, LoadDisciplineSuccess } from './discipline.actions';
import { DisciplineEffects } from './discipline.effects';
import { DisciplineTestData } from './test-data';

describe('the Discipline effects', () => {
  let actions: ReplaySubject<any>;
  let disciplineEffects: DisciplineEffects;
  let disciplineService: DisciplineService;
  const responseDisciplines = DisciplineTestData;

  const toastServiceMock: ToastrService = <ToastrService>{
    error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null,
  };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    TestBed.configureTestingModule({
      providers: [
        DisciplineEffects,
        DisciplineService,
        { provide: ToastrService, useValue: toastServiceMock },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });

    disciplineEffects = TestBed.get(DisciplineEffects);
    disciplineService = TestBed.get(DisciplineService);
  });

  describe('loadDisciplines', () => {
    it('should return a LoadDisciplineSuccess', (done) => {
      const expectedResult = new LoadDisciplineSuccess(responseDisciplines);
      spyOn(disciplineService, 'loadAllDisciplines').and.returnValue(of(responseDisciplines));

      actions.next(new LoadDiscipline(null));

      disciplineEffects.loadDisciplines$.subscribe((result) => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });

    it('should return a LoadDisciplineError', (done) => {
      spyOn(disciplineService, 'loadAllDisciplines').and.returnValue(throwError({ msg: 'Error' }));

      actions.next(new LoadDiscipline(null));

      disciplineEffects.loadDisciplines$.subscribe((result) => {
        expect(result.type).toEqual(DisciplineActionTypes.LoadError);
        done();
      });
    });
  });
});
