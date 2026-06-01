import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '@env/environment';
import { Logger } from '../logger.service';
import { TelemetryService } from '../telemetry.service';

const log = new Logger('ErrorHandlerInterceptor');

/**
 * Adds a default error handler to all requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private telemetry?: TelemetryService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(error => this.errorHandler(request, error)));
  }

  // Customize the default error handler here if needed
  private errorHandler(request: HttpRequest<any>, response: HttpEvent<any>): Observable<HttpEvent<any>> {
    this.telemetry?.trackException(response, {
      source: 'ErrorHandlerInterceptor'
    });

    this.handleUnauthorizedResponse(request, response);

    if (!environment.production) {
      // Do something with the error
      log.error('Request error', response);
    }

    return throwError(() => response);
  }

  private handleUnauthorizedResponse(request: HttpRequest<any>, response: HttpEvent<any>) {
    if (!(response instanceof HttpErrorResponse) || response.status !== 401) {
      return;
    }

    if (this.isLoginRequest(request)) {
      return;
    }

    const responseMessage = String(
      (response.error && (response.error.message || response.error.error || response.error)) || ''
    ).toLowerCase();

    if (responseMessage && responseMessage.indexOf('authentication') === -1 && responseMessage.indexOf('token') === -1) {
      return;
    }

    localStorage.removeItem('followup-token');
    localStorage.removeItem('followup-user');
    localStorage.removeItem('followup-impersonator');

    if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private isLoginRequest(request: HttpRequest<any>): boolean {
    return String(request?.url || '').indexOf('/users/login') !== -1;
  }
}
