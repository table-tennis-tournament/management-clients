import {reduceWebsocketState, WebSocketState} from './websocket.reducer';
import {ConnectMatchWebSocket, ConnectMatchWebSocketError, ConnectMatchWebSocketSuccess} from './websocket.actions';

const initialState: WebSocketState = Object.freeze({
    connected: false
});

describe('the match reducer', () => {
    it('should handle the ConnectWebsocket action correctly', () => {
        const expectedState = {
            ...initialState,
            connected: false
        };

        const newState = reduceWebsocketState(initialState, new ConnectMatchWebSocket(null));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the ConnectWebsocketSuccess action correctly', () => {
        const expectedState = {
            ...initialState,
            connected: true
        };

        const newState = reduceWebsocketState(initialState, new ConnectMatchWebSocketSuccess(true));
        expect(newState).toEqual(expectedState);
    });

    it('should handle the ConnectWebsocketError action correctly', () => {
        const expectedState = {
            ...initialState,
            connected: false
        };

        const newState = reduceWebsocketState(initialState, new ConnectMatchWebSocketError(null));
        expect(newState).toEqual(expectedState);
    });

});
