import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ToastrService } from 'ngx-toastr';
import { IndividualConfig } from 'ngx-toastr/toastr/toastr-config';
import { of, ReplaySubject } from 'rxjs';
import { WebSocketEffects } from './websocket.effects';
import { WebsocketService } from '../../shared/websocket.service';
import { ConnectWebSocket, ConnectWebSocketSuccess } from './websocket.actions';

describe('the websocket effects', () => {
  let actions: ReplaySubject<any>;
  let webSocketEffects: WebSocketEffects;
  let webSocketService: WebsocketService;

  const toastServiceMock: ToastrService = <ToastrService>{
    error: (message?: string, title?: string, override?: Partial<IndividualConfig>) => null,
  };

  beforeEach(() => {
    actions = new ReplaySubject<any>();
    TestBed.configureTestingModule({
      providers: [
        WebSocketEffects,
        WebsocketService,
        { provide: ToastrService, useValue: toastServiceMock },
        HttpClient,
        HttpHandler,
        provideMockActions(() => actions),
      ],
    });

    webSocketEffects = TestBed.get(WebSocketEffects);
    webSocketService = TestBed.get(WebsocketService);
  });

  describe('connectWebsocket', () => {
    it('should return a ConnectWebSocketSuccess', (done) => {
      const expectedResult = new ConnectWebSocketSuccess(true);
      spyOn(webSocketService, 'connectTable').and.returnValue(of({}));

      actions.next(new ConnectWebSocket(null));

      webSocketEffects.connectWebSocket$.subscribe((result) => {
        expect(result).toEqual(expectedResult);
        done();
      });
    });
  });
});
