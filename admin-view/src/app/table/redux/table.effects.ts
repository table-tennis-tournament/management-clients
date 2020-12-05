import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {
    AssignMatchToTable,
    AssignMatchToTableError,
    AssignMatchToTableSuccess,
    AssignToSecondTable,
    AssignToSecondTableError,
    AssignToSecondTableSuccess,
    FreeTable,
    FreeTableError,
    FreeTableSuccess,
    LoadTablesError,
    LoadTablesSuccess,
    LockTable,
    LockTableError,
    LockTableSuccess,
    PrintTable,
    PrintTableError,
    PrintTableSuccess,
    RemoveMatchFromTable,
    RemoveMatchFromTableError,
    RemoveMatchFromTableSuccess,
    ResultForMatch,
    ResultForMatchError,
    ResultForMatchSuccess,
    TableActionTypes,
    TakeBackTable,
    TakeBackTableError,
    TakeBackTableSuccess,
    UnLockTable,
    UnLockTableError,
    UnLockTableSuccess
} from './table.actions';
import {TableService} from '../table.service';
import {MatchService} from '../../assign/match.service';
import {PrintService} from '../../shared/print.service';

@Injectable()
export class TableEffects {

    @Effect()
    loadTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.Load),
        switchMap(() => {
            return this.tableService
                .getAllTables().pipe(
                    map(tables => new LoadTablesSuccess(tables)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Tische', '');
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
                        this.toastService.error('Fehler beim Sperren des Tisches', '');
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
                        this.toastService.error('Fehler beim Entsperren des Tisches', '');
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
                    map(() => {
                        this.toastService.success(`SpielNr. ${action.payload.matchIds} frei gemacht`);
                        return new FreeTableSuccess(action.payload);
                    }),
                    catchError(err => {
                        this.toastService.error('Fehler beim Freigeben des Tisches', '');
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
                        this.toastService.error('Fehler beim Zurücknehmen der Spiele', '');
                        return of(new TakeBackTableError(err));
                    })
                );
        })
    );

    @Effect()
    printTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.PrintTable),
        mergeMap((action: PrintTable) => {
            return this.printService.printMatch(action.payload.matchId)
                .pipe(
                    map(() => new PrintTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Drucken des Spiels', '');
                        return of(new PrintTableError(err));
                    })
                );
        })
    );

    @Effect()
    assignToSecondTable$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.AssignToSecondTable),
        mergeMap((action: AssignToSecondTable) => {
            return this.matchService.assignToSecondTable(action.payload.tableNr, action.payload.matchIds)
                .pipe(
                    map(() => new AssignToSecondTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim zuweisen des zweiten Tisches', '');
                        return of(new AssignToSecondTableError(err));
                    })
                );
        })
    );

    @Effect()
    resultForMatch$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.ResultForMatch),
        mergeMap((action: ResultForMatch) => {
            return this.matchService.resultForMatch(action.payload)
                .pipe(
                    map(() => new ResultForMatchSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler bei der Eingabe des Ergebnisses', '');
                        return of(new ResultForMatchError(err));
                    })
                );
        })
    );

    @Effect()
    assignMatchToTable$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.AssignMatchToTable),
        mergeMap((action: AssignMatchToTable) => {
            return this.matchService.assignMatchToTable(action.payload)
                .pipe(
                    map(status => {
                        if (status.successful === true) {
                            return new AssignMatchToTableSuccess(action.payload);
                        }
                        this.toastService.error(status.message);
                        return new AssignMatchToTableError(status);
                    }),
                    catchError(err => {
                        let errorMessage = 'Fehler beim Zuweisen des Spiels zum Tisch';
                        if (err.error && err.error.message) {
                            errorMessage = err.error.message;
                        }
                        this.toastService.error(errorMessage, '');
                        return of(new AssignMatchToTableError(err));
                    })
                );
        })
    );

    @Effect()
    removeMatchFromTable$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.Remove),
        mergeMap((action: RemoveMatchFromTable) => {
            return this.matchService
                .removeMatchFromTable(action.payload).pipe(
                    map(() => new RemoveMatchFromTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Entfernen der Spiele', '');
                        return of(new RemoveMatchFromTableError(err));
                    })
                );
        })
    );

    constructor(private actions$: Actions, private tableService: TableService,
                private toastService: ToastrService, private matchService: MatchService, private printService: PrintService) {

    }

}
