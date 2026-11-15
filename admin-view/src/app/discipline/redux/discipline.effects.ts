import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DisciplineService } from '../discipline.service';
import { DisciplineActionTypes, LoadDisciplineError, LoadDisciplineSuccess } from './discipline.actions';

@Injectable()
export class DisciplineEffects {
  private actions$ = inject(Actions);
  private toastService = inject(ToastrService);
  private disciplineService = inject(DisciplineService);

  loadDisciplines = createEffect(() =>
    this.actions$.pipe(
      ofType(DisciplineActionTypes.Load),
      switchMap(() => {
        return this.disciplineService.loadAllDisciplines().pipe(
          map((disciplines) => new LoadDisciplineSuccess(disciplines)),
          catchError((err) => {
            this.toastService.error('Fehler beim Laden der Konkurrenzen');
            return of(new LoadDisciplineError(err));
          })
        );
      })
    )
  );
}
