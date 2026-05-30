import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiKeyInterceptor, getApiKeyAuthValue } from './api-key.interceptor';

describe('ApiKeyInterceptor (Jest)', () => {
  const originalApiKeyAuth = environment.apiKeyAuth;
  const handler = (): HttpHandler => ({
    handle: jest.fn(() => of(new HttpResponse({ status: 200 }))) as any
  });

  beforeEach(() => {
    (environment as any).apiKeyAuth = 'bootstrap-test-key';
  });

  afterEach(() => {
    (environment as any).apiKeyAuth = originalApiKeyAuth;
  });

  it('adds ApiKeyAuth header to bootstrap auth requests', done => {
    const next = handler();
    const interceptor = new ApiKeyInterceptor();
    const req = new HttpRequest('POST', '/users/login', null);

    interceptor.intercept(req, next).subscribe({
      next: () => {
        expect(next.handle).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.anything()
          })
        );
        const calledReq = (next.handle as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
        expect(calledReq.headers.get('ApiKeyAuth')).toBe(getApiKeyAuthValue());
        done();
      },
      error: err => done.fail(err)
    });
  });

  it('does not add ApiKeyAuth header to non-bootstrap requests', done => {
    const next = handler();
    const interceptor = new ApiKeyInterceptor();
    const req = new HttpRequest('GET', '/users');

    interceptor.intercept(req, next).subscribe({
      next: () => {
        const calledReq = (next.handle as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
        expect(calledReq.headers.has('ApiKeyAuth')).toBe(false);
        done();
      },
      error: err => done.fail(err)
    });
  });

  it('does not add ApiKeyAuth header when the bootstrap key is not configured', done => {
    (environment as any).apiKeyAuth = '';

    const next = handler();
    const interceptor = new ApiKeyInterceptor();
    const req = new HttpRequest('POST', '/users/login', null);

    interceptor.intercept(req, next).subscribe({
      next: () => {
        const calledReq = (next.handle as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
        expect(calledReq.headers.has('ApiKeyAuth')).toBe(false);
        done();
      },
      error: err => done.fail(err)
    });
  });
});
