import { Injectable, inject } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of } from 'rxjs';

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

import { NotificationService } from '../../shared/notification.service';

@Injectable()
export class PlayerEffects {
  private actions$ = inject(Actions);
  private playerService = inject(PlayerService);
  private notifications = inject(NotificationService);

  loadTables = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActionTypes.Load),
      switchMap(() => {
        return this.playerService.getAllPlayerTypes().pipe(
          map((players) => new LoadPlayersSuccess(players)),
          catchError((err) => {
            this.notifications.error('Fehler beim Laden der Spieler');
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
          map(() => new SetPlayerPaidSuccess(action.payload)),
          catchError((err) => {
            this.notifications.error('Fehler beim aktiv setzen des Spielers');
            return of(new SetPlayerPaidError(err));
          })
        );
      })
    )
  );
}
