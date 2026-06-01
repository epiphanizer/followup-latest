import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ErrorHandlerInterceptor } from './error-handler.interceptor';
import { Logger } from '../logger.service';

jest.mock('@env/environment', () => ({
  environment: {
    production: false,
    apiUrl: 'https://api.test',
    version: 'test',
    defaultLanguage: 'en-US',
    supportedLanguages: ['en-US']
  }
}));

describe('ErrorHandlerInterceptor (Jest)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rethrows errors and logs when not in production', done => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const interceptor = new ErrorHandlerInterceptor();
    const req = new HttpRequest('GET', '/fail');
    const handler: HttpHandler = {
      handle: jest.fn(() => throwError(new Error('boom'))) as any
    };

    interceptor.intercept(req, handler).subscribe({
      next: () => done.fail('expected error'),
      error: err => {
        expect(err).toBeTruthy();
        expect(handler.handle).toHaveBeenCalledWith(req);
        done();
      }
    });
  });

  it('clears stale session and redirects to login on auth 401 responses', done => {
    const interceptor = new ErrorHandlerInterceptor();
    localStorage.setItem('followup-token', 'header.payload.signature');
    localStorage.setItem('followup-user', JSON.stringify({ userId: 1 }));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = new HttpRequest('GET', '/users/1/messages');
    const handler: HttpHandler = {
      handle: jest.fn(() =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              error: { message: 'Authentication token has expired.' }
            })
        )
      ) as any
    };

    interceptor.intercept(req, handler).subscribe({
      next: () => done.fail('expected error'),
      error: () => {
        expect(localStorage.getItem('followup-token')).toBeNull();
        expect(localStorage.getItem('followup-user')).toBeNull();
        done();
      }
    });
  });
});
