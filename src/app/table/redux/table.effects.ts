import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {
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
import {MatchService} from '../../match/match.service';
import {PrintService} from '../../shared/print.service';

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

    @Effect()
    printTables$: Observable<Action> = this.actions$.pipe(
        ofType(TableActionTypes.PrintTable),
        mergeMap((action: PrintTable) => {
            return this.printService.printMatch(action.payload.matchId)
                .pipe(
                    map(() => new PrintTableSuccess(action.payload)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Drucken des Spiels', 'Error');
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
                        this.toastService.error('Fehler beim zuweisen des zweiten Tisches', 'Error');
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
                        this.toastService.error('Fehler bei der Eingabe des Ergebnisses', 'Error');
                        return of(new ResultForMatchError(err));
                    })
                );
        })
    );

    constructor(private actions$: Actions, private tableService: TableService,
                private toastService: ToastrService, private matchService: MatchService, private printService: PrintService) {

    }

}
