import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {LoadPlayersSuccess, LoadTablesError, PlayerActionTypes} from './table.actions';
import {PlayerService} from '../player.service';

@Injectable()
export class TableEffects {

    @Effect()
    loadTables$: Observable<Action> = this.actions$.pipe(
        ofType(PlayerActionTypes.Load),
        switchMap(() => {
            return this.playerService
                .getAllPlayers().pipe(
                    map(players => new LoadPlayersSuccess(players)),
                    catchError(err => {
                        this.toastService.error('Fehler beim Laden der Tische', '');
                        return of(new LoadTablesError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions, private playerService: PlayerService,
                private toastService: ToastrService) {

    }

}
