import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getApiVersion } from './api-version';

@Injectable()
export class ApiVersionInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (getApiVersion() === 'v2') {
      const url = req.url.replace(/^\/?api\//, '/api/v2/');
      if (url !== req.url) {
        req = req.clone({ url });
      }
    }
    return next.handle(req);
  }
}
