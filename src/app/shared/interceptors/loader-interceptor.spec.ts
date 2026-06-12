import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoaderInterceptor } from './loader-interceptor';
import { LoaderService } from '../loader/loader.service';

const createHandler = (responseFactory: () => any): HttpHandler => ({
  handle: jest.fn(responseFactory) as any
});

const createLoaderService = () => {
  return ({
    isLoading: {
      next: jest.fn()
    }
  } as unknown) as LoaderService;
};

describe('LoaderInterceptor (smoke)', () => {
  it('sets loading true then false on success', done => {
    const loaderService = createLoaderService();
    const interceptor = new LoaderInterceptor(loaderService);
    const request = new HttpRequest('GET', '/api/test');
    const handler = createHandler(() => of(new HttpResponse({ status: 200, body: { ok: true } })));

    interceptor.intercept(request, handler).subscribe({
      next: event => {
        expect(event instanceof HttpResponse).toBe(true);
        expect(handler.handle).toHaveBeenCalledWith(request);
        expect((loaderService as any).isLoading.next).toHaveBeenCalledWith(true);
        expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(false);
        done();
      },
      error: err => {
        done.fail(err);
      }
    });
  });

  it('sets loading true then false on error', done => {
    const loaderService = createLoaderService();
    const interceptor = new LoaderInterceptor(loaderService);
    const request = new HttpRequest('GET', '/api/fail');
    const handler = createHandler(() => throwError(() => new Error('boom')));

    interceptor.intercept(request, handler).subscribe({
      next: () => {
        done.fail('expected error');
      },
      error: () => {
        expect(handler.handle).toHaveBeenCalledWith(request);
        expect((loaderService as any).isLoading.next).toHaveBeenCalledWith(true);
        expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(false);
        done();
      }
    });
  });

  it('does not log expected duplicate-account login conflicts', done => {
    const loaderService = createLoaderService();
    const interceptor = new LoaderInterceptor(loaderService);
    const request = new HttpRequest('POST', '/users/login', {});
    const loginConflict = new HttpErrorResponse({
      status: 409,
      error: {
        requiresAccountSelection: true,
        message: 'Multiple Followup accounts matched this login.'
      }
    });
    const handler = createHandler(() => throwError(() => loginConflict));
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    interceptor.intercept(request, handler).subscribe({
      next: () => {
        done.fail('expected error');
      },
      error: err => {
        expect(err).toBe(loginConflict);
        expect(consoleSpy).not.toHaveBeenCalled();
        expect((loaderService as any).isLoading.next).toHaveBeenCalledWith(true);
        expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(false);
        consoleSpy.mockRestore();
        done();
      }
    });
  });
});
