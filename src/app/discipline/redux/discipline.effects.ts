import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {DisciplineService} from '../discipline.service';
import {DisciplineActionTypes, LoadDisciplineError, LoadDisciplineSuccess} from './discipline.actions';

@Injectable()
export class DisciplineEffects {

    @Effect()
    loadDisciplines$: Observable<Action> = this.actions$.pipe(
        ofType(DisciplineActionTypes.Load),
        mergeMap(() => {
            return this.disciplineService
                .loadAllDisciplines().pipe(
                    map(disciplines => new LoadDisciplineSuccess(disciplines)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Konkurrenzen', 'Error');
                        return of(new LoadDisciplineError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private disciplineService: DisciplineService) {

    }

}
