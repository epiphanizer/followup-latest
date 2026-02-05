import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CacheInterceptor } from './cache.interceptor';
import { HttpCacheService } from './http-cache.service';

const createHandler = (factory: () => any): HttpHandler => ({
  handle: jest.fn(factory) as any
});

describe('CacheInterceptor (Jest)', () => {
  let cache: HttpCacheService;

  beforeEach(() => {
    cache = new HttpCacheService();
    cache.cleanCache();
  });

  afterEach(() => {
    cache.cleanCache();
  });

  it('caches GET responses and returns cached data on next call', done => {
    const interceptor = new CacheInterceptor(cache);
    const req = new HttpRequest('GET', '/toto');
    const handler = createHandler(() => of(new HttpResponse({ body: 'fresh' })));

    interceptor.intercept(req, handler).subscribe({
      next: res => {
        expect(res instanceof HttpResponse).toBe(true);
        expect((res as HttpResponse<any>).body).toBe('fresh');
        expect(cache.getCacheData('/toto')?.body).toBe('fresh');

        // second call should hit cache, not handler
        const handler2 = createHandler(() => of(new HttpResponse({ body: 'should-not-run' })));
        interceptor.intercept(req, handler2).subscribe({
          next: res2 => {
            expect(handler2.handle).not.toHaveBeenCalled();
            expect((res2 as HttpResponse<any>).body).toBe('fresh');
            done();
          },
          error: err => done.fail(err)
        });
      },
      error: err => done.fail(err)
    });
  });

  it('does not cache when handler errors', done => {
    const interceptor = new CacheInterceptor(cache);
    const req = new HttpRequest('GET', '/fail');
    const handler = createHandler(() => throwError(new Error('fail')));

    interceptor.intercept(req, handler).subscribe({
      next: () => done.fail('expected error'),
      error: () => {
        expect(cache.getCacheData('/fail')).toBeNull();
        done();
      }
    });
  });

  it('forces refresh when configured with update=true', done => {
    const interceptor = new CacheInterceptor(cache).configure({ update: true });
    cache.setCacheData('/toto', new HttpResponse({ body: 'old' }));
    const req = new HttpRequest('GET', '/toto');
    const handler = createHandler(() => of(new HttpResponse({ body: 'new' })));

    interceptor.intercept(req, handler).subscribe({
      next: res => {
        expect((res as HttpResponse<any>).body).toBe('new');
        expect(cache.getCacheData('/toto')?.body).toBe('new');
        expect(handler.handle).toHaveBeenCalled();
        done();
      },
      error: err => done.fail(err)
    });
  });

  it('passes through non-GET requests without caching', done => {
    const interceptor = new CacheInterceptor(cache);
    const req = new HttpRequest('POST' as any, '/submit');
    const handler = createHandler(() => of(new HttpResponse({ status: 201, body: 'ok' })));

    interceptor.intercept(req, handler).subscribe({
      next: res => {
        expect(handler.handle).toHaveBeenCalledWith(req);
        expect(cache.getCacheData('/submit')).toBeNull();
        expect((res as HttpResponse<any>).body).toBe('ok');
        done();
      },
      error: err => done.fail(err)
    });
  });
});
