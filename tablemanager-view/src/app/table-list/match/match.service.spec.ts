import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MatchService } from './match.service';

describe('the match service', () => {
  let service: MatchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MatchService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MatchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Calls [request], expects exactly one request with [method], [url] and [body], and answers it. */
  const expectRequest = (request: Observable<unknown>, method: string, url: string, body: unknown) => {
    const emitted: unknown[] = [];
    request.subscribe((value) => emitted.push(value));
    const sent = http.expectOne(url);
    expect(sent.request.method).toBe(method);
    expect(sent.request.body).toStrictEqual(body);
    sent.flush({ success: true });
    expect(emitted).toStrictEqual([{ success: true }]);
  };

  it('calls the players of a match by its id only', () => {
    expectRequest(service.callPlayersForMatch(7), 'POST', '/api/v2/playercall/7', null);
  });

  it('takes back a running match', () => {
    expectRequest(service.takeBackMatch(7), 'POST', '/api/v2/match/takeBack/7', null);
  });

  it('starts a match on a table', () => {
    expectRequest(service.startMatch(3, 7), 'POST', '/api/v2/match/start/7/3', null);
  });

  it('finishes a match with its sets', () => {
    expectRequest(
      service.finishMatch(7, {
        games: [
          { score_player_a: 11, score_player_b: 5 },
          { score_player_a: 11, score_player_b: 7 },
          { score_player_a: 11, score_player_b: 3 },
        ],
      }),
      'POST',
      '/api/v2/match/setResult/7',
      [
        [11, 5],
        [11, 7],
        [11, 3],
      ]
    );
  });
});
