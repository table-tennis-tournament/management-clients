import {Injectable} from '@angular/core';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {
    AssignToMatchList,
    AssignToMatchListError,
    AssignToMatchListSuccess,
    DeleteMatchListItem,
    DeleteMatchListItemError,
    DeleteMatchListItemSuccess,
    LoadMatchListError,
    LoadMatchListSuccess,
    MatchListActionTypes,
    MoveMatchListItem,
    MoveMatchListItemError,
    MoveMatchListItemSuccess
} from './matchlist.actions';
import {MatchListService} from '../matchlist.service';

@Injectable()
export class MatchListEffects {

    loadMatchList =  createEffect( () => this.actions$.pipe(
        ofType(MatchListActionTypes.Load),
        switchMap(() => {
            return this.matchListService
                .loadAllMatchListItems().pipe(
                    map(matches => new LoadMatchListSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der MatchList');
                        return of(new LoadMatchListError(err));
                    })
                );
        })
    ));

    assignToMatchList =  createEffect( () => this.actions$.pipe(
        ofType(MatchListActionTypes.Assign),
        mergeMap((action: AssignToMatchList) => {
            return this.matchListService
                .assignToMatchList(action.payload).pipe(
                    map(status => {
                        this.toastService.info('In Warteliste eingefügt');
                        return new AssignToMatchListSuccess(status);
                    }),
                    catchError(err => {
                        this.toastService.error('Fehler beim Hinzufügen des Matchlist-items');
                        return of(new AssignToMatchListError(err));
                    })
                );
        })
    ));

    deleteMatchListItem =  createEffect( () => this.actions$.pipe(
        ofType(MatchListActionTypes.DeleteItem),
        switchMap((action: DeleteMatchListItem) => {
            return this.matchListService
                .deleteMatchListItem(action.payload).pipe(
                    map(status => new DeleteMatchListItemSuccess(status)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Löschen des Matchlist-items');
                        return of(new DeleteMatchListItemError(err));
                    })
                );
        })
    ));

    moveMatchListItem =  createEffect( () => this.actions$.pipe(
        ofType(MatchListActionTypes.MoveItem),
        switchMap((action: MoveMatchListItem) => {
            return this.matchListService
                .moveMatchListItem(action.payload).pipe(
                    map(status => new MoveMatchListItemSuccess(status)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Verschieben des Matchlist-items');
                        return of(new MoveMatchListItemError(err));
                    })
                );
        })
    ));


    constructor(private actions$: Actions,
                private toastService: ToastrService, private matchListService: MatchListService) {

    }

}
