import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PatientCallStatusService } from './patient-call-status.service';

const makeHttp = () => ({
  post: jest.fn(() => of({ created: true } as any)),
  get: jest.fn(() => of([{ id: 1 }] as any))
});

describe('PatientCallStatusService (Jest)', () => {
  it('adds patient call status for call id', done => {
    const http = makeHttp();
    const svc = new PatientCallStatusService(http as any);

    svc.addPatientCallStatusByPatientCallId(1, 2, 3).subscribe((result: any) => {
      expect(result).toEqual({ created: true } as any);
      expect(http.post).toHaveBeenCalledWith('patients/1/calls/2/statuses', { patientCallStatusLabelId: 3 });
      done();
    });
  });

  it('gets patient call statuses', done => {
    const http = makeHttp();
    const svc = new PatientCallStatusService(http as any);

    svc.getPatientCallStatuses().subscribe((result: any) => {
      expect(result).toEqual([{ id: 1 }] as any);
      expect(http.get).toHaveBeenCalledWith('patients/calls/statuses');
      done();
    });
  });

  it('handles errors from add patient call status', done => {
    const http = {
      post: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' })))
    } as any;
    const svc = new PatientCallStatusService(http as any);

    svc.addPatientCallStatusByPatientCallId(1, 2, 3).subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toContain('alert-danger');
        done();
      }
    });
  });

  it('handles errors from get patient call statuses', done => {
    const http = { get: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' }))) } as any;
    const svc = new PatientCallStatusService(http as any);

    svc.getPatientCallStatuses().subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toContain('alert-danger');
        done();
      }
    });
  });
});
