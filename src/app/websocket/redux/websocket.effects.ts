import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {ToastrService} from 'ngx-toastr';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {
    ConnectMatchListWebSocket,
    ConnectMatchListWebSocketError,
    ConnectMatchListWebSocketSuccess,
    ConnectMatchWebSocket,
    ConnectMatchWebSocketError,
    ConnectMatchWebSocketSuccess, ConnectTableWebSocket,
    ConnectTableWebSocketError,
    ConnectTableWebSocketSuccess,
    WebSocketActionTypes
} from './websocket.actions';
import {WebsocketService} from '../../shared/websocket.service';

@Injectable()
export class WebSocketEffects {

    @Effect()
    connectMatchWebSocket$: Observable<Action> = this.actions$.pipe(
        ofType(WebSocketActionTypes.ConnectMatch),
        mergeMap((action: ConnectMatchWebSocket) => {
            return this.websocketService
                .connectMatchSocket(action.payload).pipe(
                    map(() => {
                        return new ConnectMatchWebSocketSuccess(true);
                    },
                    catchError(err => {
                        this.toastService.error('Fehler beim Verbinden auf Match WebSocket');
                        return of(new ConnectMatchWebSocketError(err));
                    })
                ));
        })
    );

    @Effect()
    connectTableWebSocket$: Observable<Action> = this.actions$.pipe(
        ofType(WebSocketActionTypes.ConnectTable),
        mergeMap((action: ConnectTableWebSocket) => {
            return this.websocketService
                .connectTable(action.payload).pipe(
                    map(() => {
                        return new ConnectTableWebSocketSuccess(true);
                    },
                    catchError(err => {
                        this.toastService.error('Fehler beim Verbinden auf Tables Websocket');
                        return of(new ConnectTableWebSocketError(err));
                    })
                ));
        })
    );

    @Effect()
    connectMatchListWebSocket$: Observable<Action> = this.actions$.pipe(
        ofType(WebSocketActionTypes.ConnectMatchList),
        mergeMap((action: ConnectMatchListWebSocket) => {
            return this.websocketService
                .connectMatchList(action.payload).pipe(
                    map(() => {
                        return new ConnectMatchListWebSocketSuccess(true);
                    },
                    catchError(err => {
                        this.toastService.error('Fehler beim Verbinden auf MatchList Websocket');
                        return of(new ConnectMatchListWebSocketError(err));
                    })
                ));
        })
    );


    constructor(private actions$: Actions,
                private toastService: ToastrService, private websocketService: WebsocketService) {

    }

}
