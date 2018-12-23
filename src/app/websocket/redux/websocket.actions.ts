import {Action} from '@ngrx/store';

export enum WebSocketActionTypes {
    Connect = '[WebSocket] Connect',
    ConnectSuccess = '[WebSocket] Connect Success',
    ConnectError = '[WebSocket] Connect Error'
}

export class ConnectWebSocket implements Action {
    readonly type = WebSocketActionTypes.Connect;

    constructor(public payload: any) {
    }
}

export class ConnectWebSocketSuccess implements Action {
    readonly type = WebSocketActionTypes.ConnectSuccess;

    constructor(public payload: any) {
    }
}

export class ConnectWebSocketError implements Action {
    readonly type = WebSocketActionTypes.ConnectError;

    constructor(public payload: any) {
    }
}


export type WebSocketActionsUnion =
    | ConnectWebSocket
    | ConnectWebSocketSuccess
    | ConnectWebSocketError;
