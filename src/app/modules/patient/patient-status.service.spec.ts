import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PatientStatusService } from './patient-status.service';

describe('PatientStatusService (Jest)', () => {
  const makeHttp = () => ({
    post: jest.fn(() => of({ id: 'ps1' } as any)),
    get: jest.fn(() => of([{ id: 'lbl1' }] as any))
  });

  it('adds patient status', done => {
    const http = makeHttp();
    const svc = new PatientStatusService(http as any);

    svc.addPatientStatusByPatientId('p1', 'lbl', 'note').subscribe((result: any) => {
      expect(result.id).toBe('ps1');
      expect(http.post).toHaveBeenCalledWith('patients/p1/statuses', {
        patientStatusLabelId: 'lbl',
        patientStatusNotes: 'note'
      });
      done();
    });
  });

  it('edits patient status', done => {
    const http = makeHttp();
    const svc = new PatientStatusService(http as any);

    svc.editPatientStatusByPatientStatusId('sid', 'lbl2', 'note2').subscribe(() => {
      expect(http.post).toHaveBeenCalledWith('patients/statuses/sid', {
        patientStatusLabelId: 'lbl2',
        patientStatusNotes: 'note2'
      });
      done();
    });
  });

  it('gets status labels and discharge labels', done => {
    const http = makeHttp();
    const svc = new PatientStatusService(http as any);

    svc.getPatientStatusLabels().subscribe((labels: any) => {
      expect(labels.length).toBe(1);
    });
    svc.getPatientDischargeLabels().subscribe((labels: any) => {
      expect(labels.length).toBe(1);
      done();
    });
  });

  it('gets status by patient id and statuses list', done => {
    const http = makeHttp();
    const svc = new PatientStatusService(http as any);

    svc.getPatientStatusByPatientId('p9').subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('patients/p9/status');
    });
    svc.getPatientStatusesByPatientId('p9').subscribe(() => {
      expect(http.get).toHaveBeenCalledWith('patients/p9/statuses');
      done();
    });
  });

  it('handles errors', done => {
    const http = { get: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' }))) } as any;
    const svc = new PatientStatusService(http as any);

    svc.getPatientStatusLabels().subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toContain('alert-danger');
        done();
      }
    });
  });
});
