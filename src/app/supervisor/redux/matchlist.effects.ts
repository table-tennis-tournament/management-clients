import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {
    AssignToMatchList, AssignToMatchListError,
    AssignToMatchListSuccess, DeleteMatchListItem, DeleteMatchListItemError, DeleteMatchListItemSuccess,
    LoadMatchListError,
    LoadMatchListSuccess,
    MatchListActionTypes
} from './matchlist.actions';
import {MatchListService} from '../matchlist.service';
import {PrintTable} from '../../table/redux/table.actions';

@Injectable()
export class MatchListEffects {

    @Effect()
    loadMatchList$: Observable<Action> = this.actions$.pipe(
        ofType(MatchListActionTypes.Load),
        mergeMap(() => {
            return this.matchListService
                .loadAllMatchListItems().pipe(
                    map(matches => new LoadMatchListSuccess(matches)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der MatchList', 'Error');
                        return of(new LoadMatchListError(err));
                    })
                );
        })
    );

    @Effect()
    assignToMatchList$: Observable<Action> = this.actions$.pipe(
        ofType(MatchListActionTypes.Assign),
        switchMap((action: AssignToMatchList) => {
            return this.matchListService
                .assignToMatchList(action.payload).pipe(
                    map(status => new AssignToMatchListSuccess(status)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Hinzufügen des Matchlist-items', 'Error');
                        return of(new AssignToMatchListError(err));
                    })
                );
        })
    );

    @Effect()
    deleteMatchListItem$: Observable<Action> = this.actions$.pipe(
        ofType(MatchListActionTypes.DeleteItem),
        switchMap((action: DeleteMatchListItem) => {
            return this.matchListService
                .deleteMatchListItem(action.payload).pipe(
                    map(status => new DeleteMatchListItemSuccess(status)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Löschen des Matchlist-items', 'Error');
                        return of(new DeleteMatchListItemError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private matchListService: MatchListService) {

    }

}
