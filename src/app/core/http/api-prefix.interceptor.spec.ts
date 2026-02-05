import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiPrefixInterceptor } from './api-prefix.interceptor';
import { environment } from '@env/environment';

describe('ApiPrefixInterceptor (Jest)', () => {
  const handler = (): HttpHandler => ({
    handle: jest.fn(() => of(new HttpResponse({ status: 200 }))) as any
  });

  it('prefixes relative URLs with apiUrl', done => {
    const next = handler();
    const interceptor = new ApiPrefixInterceptor();
    const req = new HttpRequest('GET', '/toto');

    interceptor.intercept(req, next).subscribe({
      next: () => {
        expect(next.handle).toHaveBeenCalledWith(expect.objectContaining({ url: `${environment.apiUrl}/toto` }));
        done();
      },
      error: err => done.fail(err)
    });
  });

  it('leaves absolute URLs untouched', done => {
    const next = handler();
    const interceptor = new ApiPrefixInterceptor();
    const url = 'https://domain.com/toto';
    const req = new HttpRequest('GET', url);

    interceptor.intercept(req, next).subscribe({
      next: () => {
        expect(next.handle).toHaveBeenCalledWith(expect.objectContaining({ url }));
        done();
      },
      error: err => done.fail(err)
    });
  });
});
