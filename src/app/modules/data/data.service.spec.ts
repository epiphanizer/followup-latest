import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DataService } from './data.service';

describe('DataService (Jest)', () => {
  it('fetches data blob', done => {
    const http = { get: jest.fn(() => of('blob' as any)) } as any;
    const svc = new DataService(http);

    svc.getData().subscribe((result: any) => {
      expect(result).toBe('blob');
      expect(http.get).toHaveBeenCalledWith('data', { responseType: 'blob' as 'json' });
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
