import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {MzToastService} from 'ngx-materialize';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {LoadTablesError, LoadTablesSuccess, TableActionTypes} from './table.actions';
import {TableService} from '../table.service';

@Injectable()
export class TableEffects {

    @Effect()
    search$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.Load),
        mergeMap(() => {
            return this.tableService
                .getAllTables().pipe(
                    map(tables => new LoadTablesSuccess(tables)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Tische', 'Error');
                        return of(new LoadTablesError(err))
                    })
                );
        })
    );

    constructor(private actions$: Actions, private tableService: TableService, private toastService: ToastrService) {

    }

}