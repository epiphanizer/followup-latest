import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_KEY_AUTH_VALUE = '8341c9e6-8adb-469b-8d66-f58cbcda720c';
var API_KEY_BOOTSTRAP_PATHS = ['/users/login', '/users/auth'];

function getRequestPath(url: string): string {
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch (_error) {
    return String(url || '').split('?')[0];
  }
}

function shouldAttachApiKey(url: string): boolean {
  return API_KEY_BOOTSTRAP_PATHS.includes(getRequestPath(url));
}

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!shouldAttachApiKey(request.url)) {
      return next.handle(request);
    }

    request = request.clone({
      setHeaders: {
        ApiKeyAuth: API_KEY_AUTH_VALUE
      }
    });

    return next.handle(request);
  }
}
