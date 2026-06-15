import { HttpResponse } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DataService } from './data.service';

describe('DataService (Jest)', () => {
  it('fetches data blob', done => {
    const response = new HttpResponse({
      body: new Blob(['blob'], { type: 'application/octet-stream' }),
      headers: undefined,
      status: 200
    });
    const http = { get: jest.fn(() => of(response as any)) } as any;
    const svc = new DataService(http);

    svc.getData().subscribe((result: any) => {
      expect(result).toBe(response);
      expect(http.get).toHaveBeenCalledWith('data', { observe: 'response', responseType: 'blob' });
      done();
    });
  });

  it('handles errors from getData', done => {
    const http = {
      get: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' })))
    } as any;
    const svc = new DataService(http);

    svc.getData().subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err.message).toContain('authentication');
        done();
      }
    });
  });
});
