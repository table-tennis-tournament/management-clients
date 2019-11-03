import {WebSocketActionsUnion, WebSocketActionTypes} from './websocket.actions';

export interface WebSocketState {
    connected: boolean;
}

const initialState: WebSocketState = {
    connected: false
};

export function reduceWebsocketState(state: WebSocketState = initialState, action: WebSocketActionsUnion) {
    switch (action.type) {
        case WebSocketActionTypes.ConnectMatch:
            return {
                ...state,
                connected: false
            };
        case WebSocketActionTypes.ConnectMatchSuccess:
            return {
                connected: true
            };
        case WebSocketActionTypes.ConnectMatchError:
            return {
                ...state,
                connected: false
            };
        default:
            return state;
    }

}

export const getWebsocketConnectedState = (state: WebSocketState) => state.connected;
