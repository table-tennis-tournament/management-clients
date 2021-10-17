import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  ConnectWebSocket,
  ConnectWebSocketError,
  ConnectWebSocketSuccess,
  WebSocketActionTypes,
} from './websocket.actions';
import { WebsocketService } from '../../shared/websocket.service';

@Injectable()
export class WebSocketEffects {
  connectWebSocket = createEffect(() =>
    this.actions$.pipe(
      ofType(WebSocketActionTypes.ConnectWebsocket),
      mergeMap((action: ConnectWebSocket) => {
        return this.websocketService.connectTable(action.payload).pipe(
          map(
            () => {
              return new ConnectWebSocketSuccess(true);
            },
            catchError((err) => {
              this.toastService.error('Fehler beim Verbinden mit Websocket');
              return of(new ConnectWebSocketError(err));
            })
          )
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private toastService: ToastrService,
    private websocketService: WebsocketService
  ) {}
}
