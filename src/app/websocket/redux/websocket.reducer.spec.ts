import {reduceWebsocketState, WebSocketState} from './websocket.reducer';
import {ConnectWebSocket, ConnectWebSocketError, ConnectWebSocketSuccess} from './websocket.actions';

const initialState: WebSocketState = Object.freeze({
    connected: false
});

describe('the match reducer', () => {
    it('should handle the ConnectWebsocket action correctly', () => {
        const expectedState = {
            ...initialState,
            connected: false
        };

        const newState = reduceWebsocketState(initialState, new ConnectWebSocket(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the ConnectWebsocketSuccess action correctly', () => {
        const expectedState = {
            ...initialState,
            connected: true
        };

        const newState = reduceWebsocketState(initialState, new ConnectWebSocketSuccess(true));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the ConnectWebsocketError action correctly', () => {
        const expectedState = {
            ...initialState,
            connected: false
        };

        const newState = reduceWebsocketState(initialState, new ConnectWebSocketError(null));
        expect(newState).toEqual(expectedState);
    });

});
