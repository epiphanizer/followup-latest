import { HttpErrorResponse } from '@angular/common/http';
import { throwError, of } from 'rxjs';
import { PatientCallService } from './patient-call.service';

describe('PatientCallService (Jest)', () => {
  it('creates with minimal http stub', () => {
    const http = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } as any;
    const service = new PatientCallService(http as any);

    expect(service).toBeTruthy();
  });

  it('delegates start and end calls to http service', () => {
    const http = {
      post: jest.fn(() => of({})),
      get: jest.fn(() => of({}))
    } as any;
    const service = new PatientCallService(http);

    service.startPatientCallByUserIdAndPatientCallId('u1', 'pc1').subscribe();
    service.endPatientCall('pc1').subscribe();

    expect(http.post).toHaveBeenCalledWith('patients/calls/pc1/start', { userId: 'u1' });
    expect(http.post).toHaveBeenCalledWith('patients/calls/pc1/end', {});
  });

  it('wraps errors through handleAsyncError', done => {
    const http = {
      get: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'boom' })))
    } as any;
    const service = new PatientCallService(http);

    service.getPatientCallsByPatientId('p1').subscribe({
      next: () => done.fail('expected error'),
      error: err => {
        expect(err).toContain('patient call service');
        done();
      }
    });
  });

  it('logs client-side errors in handleAsyncError', done => {
    const http = {
      get: jest.fn(() =>
        throwError(() => new HttpErrorResponse({ error: new ErrorEvent('Network', { message: 'offline' }), status: 0 }))
      )
    } as any;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const service = new PatientCallService(http);

    service.getPatientCallsByOperationId('op1').subscribe({
      error: msg => {
        expect(consoleSpy).toHaveBeenCalled();
        expect(msg).toContain('patient call service');
        consoleSpy.mockRestore();
        done();
      }
    });
  });
});
