import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

var API_KEY_BOOTSTRAP_PATHS = ['/users/login'];
var LOCAL_DEV_API_KEY_AUTH_FALLBACK = '8341c9e6-8adb-469b-8d66-f58cbcda720c';

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

function isLocalApiUrl(url: string): boolean {
  try {
    var hostname = new URL(String(url || ''), 'http://localhost').hostname;
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
  } catch (_error) {
    return false;
  }
}

export function getApiKeyAuthValue(): string {
  var configuredApiKey = String(environment.apiKeyAuth || '').trim();

  if (configuredApiKey) {
    return configuredApiKey;
  }

  if (isLocalApiUrl(String(environment.apiUrl || ''))) {
    return LOCAL_DEV_API_KEY_AUTH_FALLBACK;
  }

  return '';
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
