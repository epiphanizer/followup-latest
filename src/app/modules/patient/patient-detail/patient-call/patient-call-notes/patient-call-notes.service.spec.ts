import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PatientCallNotesService } from './patient-call-notes.service';

describe('PatientCallNotesService (Jest)', () => {
  it('adds patient call notes', done => {
    const http = { post: jest.fn(() => of({ created: true } as any)) } as any;
    const svc = new PatientCallNotesService(http as any);

    svc.addPatientCallNotesByPatientCallId('pc1', 'note', 1).subscribe((result: any) => {
      expect(result).toEqual({ created: true });
      expect(http.post).toHaveBeenCalledWith('patients/calls/pc1/notes', {
        patientCallNotes: 'note',
        patientCallNotesHighlighted: 1
      });
      done();
    });
  });

  it('gets patient call notes', done => {
    const http = { post: jest.fn(() => of([{ id: 'n1' }] as any)) } as any;
    const svc = new PatientCallNotesService(http as any);

    svc.getPatientCallNotesByPatientCallId('pc2').subscribe((result: any) => {
      expect(result[0].id).toBe('n1');
      expect(http.post).toHaveBeenCalledWith('patients/calls/pc2/notes');
      done();
    });
  });

  it('handles errors', done => {
    const http = {
      post: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' })))
    } as any;
    const svc = new PatientCallNotesService(http as any);

    svc.getPatientCallNotesByPatientCallId('pc3').subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toContain('alert-danger');
        done();
      }
    });
  });
});
