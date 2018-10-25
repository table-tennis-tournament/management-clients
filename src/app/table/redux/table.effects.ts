import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {
    FreeTable,
    FreeTableError,
    FreeTableSuccess,
    LoadTablesError,
    LoadTablesSuccess,
    LockTable,
    LockTableError,
    LockTableSuccess,
    TableActionTypes,
    TakeBackTable,
    TakeBackTableError,
    TakeBackTableSuccess,
    UnLockTable,
    UnLockTableError,
    UnLockTableSuccess
} from './table.actions';
import {TableService} from '../table.service';
import {MatchService} from '../../match/match.service';

@Injectable()
export class TableEffects {

    @Effect()
    loadTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.Load),
        mergeMap(() => {
            return this.tableService
                .getAllTables().pipe(
                    map(tables => new LoadTablesSuccess(tables)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Tische', 'Error');
                        return of(new LoadTablesError(err));
                    })
                );
        })
    );

    @Effect()
    lockTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.Lock),
        mergeMap((action: LockTable) => {
            return this.tableService
                .lockTable(action.payload).pipe(
                    map(() => new LockTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Sperren des Tisches', 'Error');
                        return of(new LockTableError(err));
                    })
                );
        })
    );

    @Effect()
    unLockTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.UnLock),
        mergeMap((action: UnLockTable) => {
            return this.tableService
                .unLockTable(action.payload).pipe(
                    map(() => new UnLockTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Entsperren des Tisches', 'Error');
                        return of(new UnLockTableError(err));
                    })
                );
        })
    );

    @Effect()
    freeTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.Free),
        mergeMap((action: FreeTable) => {
            return this.matchService
                .freeMatches(action.payload.matchIds).pipe(
                    map(() => new FreeTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Freigeben des Tisches', 'Error');
                        return of(new FreeTableError(err));
                    })
                );
        })
    );

    @Effect()
    takeBackTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.TakeBack),
        mergeMap((action: TakeBackTable) => {
            return this.matchService
                .takeBackMatches(action.payload.matchIds).pipe(
                    map(() => new TakeBackTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Zurücknehmen der Spiele', 'Error');
                        return of(new TakeBackTableError(err));
                    })
                );
        })
    );

    constructor(private actions$: Actions, private tableService: TableService,
                private toastService: ToastrService, private matchService: MatchService) {

    }

}
