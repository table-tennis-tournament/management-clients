import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  LoadPlayersError,
  LoadPlayersSuccess,
  PlayerActionTypes,
  SetPlayerPaid,
  SetPlayerPaidError,
  SetPlayerPaidSuccess,
} from './player.actions';
import { PlayerService } from '../player.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class PlayerEffects {
  loadTables = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActionTypes.Load),
      switchMap(() => {
        return this.playerService.getAllPlayerTypes().pipe(
          map((players) => new LoadPlayersSuccess(players)),
          catchError((err) => {
            this.toastService.error('Fehler beim Laden der Spieler', '');
            return of(new LoadPlayersError(err));
          })
        );
      })
    )
  );

  playerPaid = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActionTypes.SetPaid),
      switchMap((action: SetPlayerPaid) => {
        return this.playerService.setPlayerPaid(action.payload).pipe(
          map((players) => new SetPlayerPaidSuccess(action.payload)),
          catchError((err) => {
            this.toastService.error('Fehler beim aktiv setzen des Spielers', '');
            return of(new SetPlayerPaidError(err));
          })
        );
      })
    )
  );

  constructor(private actions$: Actions, private playerService: PlayerService, private toastService: ToastrService) {}
}
