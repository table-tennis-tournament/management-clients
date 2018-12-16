import {HttpClient, HttpHandler} from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {ToastrService} from 'ngx-toastr';
import {IndividualConfig} from 'ngx-toastr/toastr/toastr-config';
import {of, ReplaySubject, throwError} from 'rxjs';
import {WebSocketEffects} from './websocket.effects';
import {WebsocketService} from '../../shared/websocket.service';
import {ConnectWebSocket, ConnectWebSocketSuccess, WebSocketActionTypes} from './websocket.actions';

describe('the websocket effects', () => {
    let actions: ReplaySubject<any>;
    let webSocketEffects: WebSocketEffects;
    let webSocketService: WebsocketService;


    const toastServiceMock: ToastrService = <ToastrService>{
        error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null
    };

    beforeEach(() => {
        actions = new ReplaySubject<any>();
        TestBed.configureTestingModule({
            providers: [
                WebSocketEffects,
                WebsocketService,
                {provide: ToastrService, useValue: toastServiceMock},
                HttpClient,
                HttpHandler,
                provideMockActions(() => actions)
            ]
        });

        webSocketEffects = TestBed.get(WebSocketEffects);
        webSocketService = TestBed.get(WebsocketService);
    });

    describe('connectWebsocket', () => {

        it('should return a ConnectWebSocketSuccess', (done) => {
            const expectedResult = new ConnectWebSocketSuccess(true);
            spyOn(webSocketService, 'connectSocket').and.returnValue(of({}));
            spyOn(webSocketService, 'registerListeners');

            actions.next(new ConnectWebSocket(null));

            webSocketEffects.connectWebSocket$.subscribe((result) => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        // it('should return a ConnectWebSocketError', (done) => {
        //     spyOn(webSocketService, 'connectSocket').and.returnValue(throwError({msg: 'Error'}));
        //
        //     actions.next(new ConnectWebSocket(null));
        //
        //     webSocketEffects.connectWebSocket$.subscribe((result) => {
        //         expect(result.type).toEqual(WebSocketActionTypes.ConnectError);
        //         done();
        //     });
        // });


    });

});
