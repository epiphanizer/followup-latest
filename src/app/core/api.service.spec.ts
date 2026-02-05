import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';

import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService (Jest)', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('performs GET requests with params and base url', () => {
    const params = new HttpParams().set('q', '1');
    const resp = { ok: true } as any;

    service.get('/items', params).subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne(r => r.url === environment.apiUrl + '/items');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('1');
    req.flush(resp);
  });

  it('performs POST requests and stringifies bodies', () => {
    const payload = { name: 'test' } as any;

    service.post('/items', payload).subscribe(result => {
      expect(result).toEqual(payload);
    });

    const req = httpMock.expectOne(environment.apiUrl + '/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(JSON.stringify(payload));
    req.flush(payload);
  });

  it('performs PUT requests and stringifies bodies', () => {
    const payload = { name: 'update' } as any;
    const resp = { ok: true } as any;

    service.put('/items/1', payload).subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne(environment.apiUrl + '/items/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(JSON.stringify(payload));
    req.flush(resp);
  });

  it('performs DELETE requests', () => {
    const resp = { deleted: true } as any;

    service.delete('/items/2').subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne(environment.apiUrl + '/items/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(resp);
  });

  it('surfaces formatted errors', () => {
    const errorResponse = { error: 'boom' } as any;
    let caught: any;

    service.get('/fail').subscribe({
      next: () => fail('expected error'),
      error: err => {
        caught = err;
      }
    });

    const req = httpMock.expectOne(environment.apiUrl + '/fail');
    req.flush(errorResponse, { status: 500, statusText: 'Server Error' });

    expect(caught).toEqual({ error: 'boom' } as any);
  });
});
