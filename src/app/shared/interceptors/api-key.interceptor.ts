import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

var API_KEY_BOOTSTRAP_PATHS = ['/users/login'];

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

export function getApiKeyAuthValue(): string {
  return String(environment.apiKeyAuth || '').trim();
}

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var apiKeyAuthValue = getApiKeyAuthValue();

    if (!shouldAttachApiKey(request.url) || !apiKeyAuthValue) {
      return next.handle(request);
    }

    request = request.clone({
      setHeaders: {
        ApiKeyAuth: apiKeyAuthValue
      }
    });

    return next.handle(request);
  }
}
