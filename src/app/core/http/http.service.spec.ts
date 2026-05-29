import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HttpService } from './http.service';
import { ApiPrefixInterceptor } from './api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './error-handler.interceptor';

const passthroughInterceptor = {
  intercept: (req: any, next: any) => next.handle(req)
};

describe('HttpService (Jest)', () => {
  let http: HttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpService,
        { provide: ApiPrefixInterceptor, useValue: passthroughInterceptor },
        { provide: ErrorHandlerInterceptor, useValue: passthroughInterceptor }
      ]
    });

    http = TestBed.get(HttpService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
  });

  it('creates service', () => {
    expect(http).toBeTruthy();
  });

  it('performs GET requests', done => {
    http.get('/toto').subscribe(body => {
      expect(body).toEqual({ ok: true });
      done();
    });

    const req = httpMock.expectOne('/toto');
    expect(req.request.method).toBe('GET');
    req.flush({ ok: true });
  });
});
