import {Action} from '@ngrx/store';

export enum WebSocketActionTypes {
    ConnectMatch = '[WebSocket] Match Connect',
    ConnectMatchSuccess = '[WebSocket] Match Connect Success',
    ConnectMatchError = '[WebSocket] Match Connect Error',
    ConnectTable = '[WebSocket] Table Connect',
    ConnectTableSuccess = '[WebSocket] Table Connect Success',
    ConnectTableError = '[WebSocket] Table Connect Error',
    ConnectMatchList = '[WebSocket] MatchList Connect',
    ConnectMatchListSuccess = '[WebSocket] MatchList Connect Success',
    ConnectMatchListError = '[WebSocket] MatchList Connect Error'
}

export class ConnectMatchWebSocket implements Action {
    readonly type = WebSocketActionTypes.ConnectMatch;

    constructor(public payload: any) {
    }
}

export class ConnectMatchWebSocketSuccess implements Action {
    readonly type = WebSocketActionTypes.ConnectMatchSuccess;

    constructor(public payload: any) {
    }
}

export class ConnectMatchWebSocketError implements Action {
    readonly type = WebSocketActionTypes.ConnectMatchError;

    constructor(public payload: any) {
    }
}

export class ConnectTableWebSocket implements Action {
    readonly type = WebSocketActionTypes.ConnectTable;

    constructor(public payload: any) {
    }
}

export class ConnectTableWebSocketSuccess implements Action {
    readonly type = WebSocketActionTypes.ConnectTableSuccess;

    constructor(public payload: any) {
    }
}

export class ConnectTableWebSocketError implements Action {
    readonly type = WebSocketActionTypes.ConnectTableError;

    constructor(public payload: any) {
    }
}

export class ConnectMatchListWebSocket implements Action {
    readonly type = WebSocketActionTypes.ConnectMatchList;

    constructor(public payload: any) {
    }
}

export class ConnectMatchListWebSocketSuccess implements Action {
    readonly type = WebSocketActionTypes.ConnectMatchListSuccess;

    constructor(public payload: any) {
    }
}

export class ConnectMatchListWebSocketError implements Action {
    readonly type = WebSocketActionTypes.ConnectMatchListError;

    constructor(public payload: any) {
    }
}


export type WebSocketActionsUnion =
    | ConnectMatchWebSocket
    | ConnectMatchWebSocketSuccess
    | ConnectMatchWebSocketError
    | ConnectTableWebSocket
    | ConnectTableWebSocketSuccess
    | ConnectTableWebSocketError
    | ConnectMatchListWebSocket
    | ConnectMatchListWebSocketSuccess
    | ConnectMatchListWebSocketError;
