import { HttpHandler, HttpRequest } from '@angular/common/http';
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
});
