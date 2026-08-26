import { HttpErrorResponse } from '@angular/common/http';
import { throwError, of } from 'rxjs';
import { PatientCallService } from './patient-call.service';
import { SKIP_GLOBAL_LOADER } from '@app/shared/interceptors/loader-interceptor';

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
      error: (err: string) => {
        expect(err).toContain('patient call service');
        done();
      }
    });
  });

  it('loads patient detail call reads without the global loader', () => {
    const http = {
      get: jest.fn(() => of([{ patientCallId: 'pc-1' }]))
    } as any;
    const service = new PatientCallService(http);

    service.getPatientCallByPatientCallId('p1', 'pc-1').subscribe();
    service.getPatientCallsByPatientId('p1').subscribe();

    expect(http.get).toHaveBeenNthCalledWith(
      1,
      'patients/p1/calls/pc-1',
      expect.objectContaining({ context: expect.anything() })
    );
    expect(http.get).toHaveBeenNthCalledWith(
      2,
      'patients/p1/calls',
      expect.objectContaining({ context: expect.anything() })
    );
    expect(http.get.mock.calls[0][1].context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    expect(http.get.mock.calls[1][1].context.get(SKIP_GLOBAL_LOADER)).toBe(true);
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
      error: (msg: string) => {
        expect(consoleSpy).toHaveBeenCalled();
        expect(msg).toContain('patient call service');
        consoleSpy.mockRestore();
        done();
      }
    });
  });

  it('reuses cached operation call lookups until a call mutation clears the cache', () => {
    const http = {
      get: jest.fn(() => of([{ patientCallId: 'pc-1' }])),
      post: jest.fn(() => of({}))
    } as any;
    const service = new PatientCallService(http);

    service.getPatientCallsByOperationId('op-1').subscribe();
    service.getPatientCallsByOperationId('op-1').subscribe();

    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith(
      'operations/op-1/calls',
      expect.objectContaining({ context: expect.anything() })
    );
    expect(http.get.mock.calls[0][1].context.get(SKIP_GLOBAL_LOADER)).toBe(true);

    service.endPatientCall('pc-1').subscribe();
    service.getPatientCallsByOperationId('op-1').subscribe();

    expect(http.post).toHaveBeenCalledWith('patients/calls/pc-1/end', {});
    expect(http.get).toHaveBeenCalledTimes(2);
  });

  it('scopes spanish call history requests and cache entries by date', () => {
    const http = {
      get: jest.fn(() => of([]))
    } as any;
    const service = new PatientCallService(http);

    service.getSpanishSpeakingPatientCalls('2026-08-25T12:00:00Z').subscribe();
    service.getSpanishSpeakingPatientCalls('2026-08-25T12:00:00Z').subscribe();
    service.getSpanishSpeakingPatientCalls('2026-08-26').subscribe();

    expect(http.get).toHaveBeenCalledTimes(2);
    expect(http.get).toHaveBeenNthCalledWith(
      1,
      'spanish/calls?filterDate=2026-08-25',
      expect.objectContaining({ context: expect.anything() })
    );
    expect(http.get).toHaveBeenNthCalledWith(
      2,
      'spanish/calls?filterDate=2026-08-26',
      expect.objectContaining({ context: expect.anything() })
    );
    expect(http.get.mock.calls[0][1].context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    expect(http.get.mock.calls[1][1].context.get(SKIP_GLOBAL_LOADER)).toBe(true);
  });
});
