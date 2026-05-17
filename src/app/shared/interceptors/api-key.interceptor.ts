import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_KEY_AUTH_VALUE = '8341c9e6-8adb-469b-8d66-f58cbcda720c';

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        ApiKeyAuth: API_KEY_AUTH_VALUE
      }
    });

    return next.handle(request);
  }
}
