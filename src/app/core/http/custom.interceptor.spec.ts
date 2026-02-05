import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';

import { CustomInterceptor } from './custom.interceptor';

describe('CustomInterceptor (Jest)', () => {
  it('adds cache-busting headers on GET requests', () => {
    const interceptor = new CustomInterceptor();
    const next = { handle: jest.fn().mockReturnValue(of('ok')) } as any;
    const request = new HttpRequest('GET', '/test');

    interceptor.intercept(request, next).subscribe(response => {
      expect(response).toBe('ok');
    });

    const handledRequest = (next.handle as jest.Mock).mock.calls[0][0] as HttpRequest<any>;
    expect(handledRequest.headers.get('Cache-Control')).toBe('no-cache');
    expect(handledRequest.headers.get('Pragma')).toBe('no-cache');
  });

  it('passes through non-GET requests unchanged', () => {
    const interceptor = new CustomInterceptor();
    const next = { handle: jest.fn().mockReturnValue(of('ok')) } as any;
    const request = new HttpRequest('POST', '/test', { name: 'x' });

    interceptor.intercept(request, next).subscribe();

    const handledRequest = (next.handle as jest.Mock).mock.calls[0][0] as HttpRequest<any>;
    expect(handledRequest).toBe(request);
    expect(handledRequest.headers.has('Cache-Control')).toBe(false);
  });
});
