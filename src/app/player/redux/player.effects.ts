import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {LoadPlayersError, LoadPlayersSuccess, PlayerActionTypes} from './player.actions';
import {PlayerService} from '../player.service';

@Injectable()
export class PlayerEffects {

    @Effect()
    loadTables$: Observable<Action> = this.actions$.pipe(
        ofType(PlayerActionTypes.Load),
        switchMap(() => {
            return this.playerService
                .getAllPlayers().pipe(
                    map(players => new LoadPlayersSuccess(players)),
                    catchError(err => {
                        // this.toastService.error('Fehler beim Laden der Spieler', '');
                        return of(new LoadPlayersError(err));
                    })
                );
        })
    );


    constructor(private actions$: Actions, private playerService: PlayerService) {
    }

}
