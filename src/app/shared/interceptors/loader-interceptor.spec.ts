import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { NEVER, of, throwError } from 'rxjs';
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
  it('sets loading true then false on success', () => {
    const loaderService = createLoaderService();
    const interceptor = new LoaderInterceptor(loaderService);
    const request = new HttpRequest('GET', '/api/test');
    const handler = createHandler(() => of(new HttpResponse({ status: 200, body: { ok: true } })));

    let receivedEvent: HttpEvent<any>;
    interceptor.intercept(request, handler).subscribe({
      next: event => {
        receivedEvent = event;
      },
      error: err => {
        throw err;
      }
    });

    expect(receivedEvent instanceof HttpResponse).toBe(true);
    expect(handler.handle).toHaveBeenCalledWith(request);
    expect((loaderService as any).isLoading.next).toHaveBeenCalledWith(true);
    expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(false);
  });

  it('sets loading true then false on error', () => {
    const loaderService = createLoaderService();
    const interceptor = new LoaderInterceptor(loaderService);
    const request = new HttpRequest('GET', '/api/fail');
    const handler = createHandler(() => throwError(() => new Error('boom')));

    let receivedError: any;
    interceptor.intercept(request, handler).subscribe({
      next: () => {
        throw new Error('expected error');
      },
      error: err => {
        receivedError = err;
      }
    });

    expect(receivedError).toBeDefined();
    expect(handler.handle).toHaveBeenCalledWith(request);
    expect((loaderService as any).isLoading.next).toHaveBeenCalledWith(true);
    expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(false);
  });

  it('does not log expected duplicate-account login conflicts', () => {
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

    let receivedError: any;
    interceptor.intercept(request, handler).subscribe({
      next: () => {
        throw new Error('expected error');
      },
      error: err => {
        receivedError = err;
      }
    });

    expect(receivedError).toBe(loginConflict);
    expect(consoleSpy).not.toHaveBeenCalled();
    expect((loaderService as any).isLoading.next).toHaveBeenCalledWith(true);
    expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(false);
    consoleSpy.mockRestore();
  });

  it('forces a hung request to error out so the spinner cannot stay on forever', () => {
    jest.useFakeTimers();
    const loaderService = createLoaderService();
    const interceptor = new LoaderInterceptor(loaderService);
    const request = new HttpRequest('GET', '/api/hangs');
    const handler = createHandler(() => NEVER);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const errorSpy = jest.fn();
    interceptor.intercept(request, handler).subscribe({ next: () => undefined, error: errorSpy });

    expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(true);

    jest.advanceTimersByTime((interceptor as any).requestTimeoutMs + 1);

    expect(errorSpy).toHaveBeenCalled();
    expect((loaderService as any).isLoading.next).toHaveBeenLastCalledWith(false);

    consoleSpy.mockRestore();
    jest.useRealTimers();
  });
});
