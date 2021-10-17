import { Action } from '@ngrx/store';

export enum WebSocketActionTypes {
  ConnectWebsocket = '[WebSocket] Connect',
  ConnectWebsocketSuccess = '[WebSocket] Connect Success',
  ConnectWebsocketError = '[WebSocket] Connect Error',
}

export class ConnectWebSocket implements Action {
  readonly type = WebSocketActionTypes.ConnectWebsocket;

  constructor(public payload: any) {}
}

export class ConnectWebSocketSuccess implements Action {
  readonly type = WebSocketActionTypes.ConnectWebsocketSuccess;

  constructor(public payload: any) {}
}

export class ConnectWebSocketError implements Action {
  readonly type = WebSocketActionTypes.ConnectWebsocketError;

  constructor(public payload: any) {}
}

export type WebSocketActionsUnion = ConnectWebSocket | ConnectWebSocketSuccess | ConnectWebSocketError;
