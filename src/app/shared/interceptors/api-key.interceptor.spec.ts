import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiKeyInterceptor } from './api-key.interceptor';

describe('ApiKeyInterceptor (Jest)', () => {
  const handler = (): HttpHandler => ({
    handle: jest.fn(() => of(new HttpResponse({ status: 200 }))) as any
  });

  it('adds ApiKeyAuth header to outgoing requests', done => {
    const next = handler();
    const interceptor = new ApiKeyInterceptor();
    const req = new HttpRequest('GET', '/path');

    interceptor.intercept(req, next).subscribe({
      next: () => {
        expect(next.handle).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.anything()
          })
        );
        const calledReq = (next.handle as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
        expect(calledReq.headers.get('ApiKeyAuth')).toBe('8341c9e6-8adb-469b-8d66-f58cbcda720c');
        done();
      },
      error: err => done.fail(err)
    });
  });
});
