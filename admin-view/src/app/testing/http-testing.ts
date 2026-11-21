import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

/** One HTTP call of a service: what the test calls and the complete request it expects. */
export interface RequestCase<S> {
  call: (service: S) => Observable<unknown>;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body: unknown;
  /** What the backend answers; defaults to `{ success: true }`. */
  response?: unknown;
  /** What the service emits for [response]; defaults to [response] itself. */
  emitted?: unknown;
}

/**
 * Generates one test per case: the service sends exactly one request with the method, URL and body of
 * the case, and emits the (mapped) response. Unit tests are the only place that pins URLs and bodies;
 * without them only the e2e tests notice a changed endpoint.
 */
export function describeRequests<S>(serviceType: Type<S>, cases: RequestCase<S>[], providers: Provider[] = []) {
  describe(`${serviceType.name} requests`, () => {
    let service: S;
    let http: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [...providers, provideHttpClient(), provideHttpClientTesting()],
      });
      service = TestBed.inject(serviceType);
      http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    cases.forEach((testCase) => {
      it(`sends ${testCase.method} ${testCase.url}`, () => {
        const response = testCase.response === undefined ? { success: true } : testCase.response;
        const emitted: unknown[] = [];

        testCase.call(service).subscribe((value) => emitted.push(value));
        const request = http.expectOne(testCase.url);
        expect(request.request.method).toBe(testCase.method);
        expect(request.request.body).toEqual(testCase.body);
        request.flush(response);

        expect(emitted).toEqual([testCase.emitted === undefined ? response : testCase.emitted]);
      });
    });
  });
}
