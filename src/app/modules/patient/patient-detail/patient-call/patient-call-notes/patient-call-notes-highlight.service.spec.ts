import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PatientCallNotesHighlightService } from './patient-call-notes-highlight.service';

describe('PatientCallNotesHighlightService (Jest)', () => {
  it('adds highlight by note id', done => {
    const http = { post: jest.fn(() => of({ created: true } as any)) } as any;
    const svc = new PatientCallNotesHighlightService(http as any);

    svc.addPatientCallHighlightByPatientCallNoteId(5).subscribe((result: any) => {
      expect(result).toEqual({ created: true });
      expect(http.post).toHaveBeenCalledWith('patients/calls/5');
      done();
    });
  });

  it('gets highlights by patient call id', done => {
    const http = { post: jest.fn(() => of([{ id: 'h1' }] as any)) } as any;
    const svc = new PatientCallNotesHighlightService(http as any);

    svc.getPatientCallNoteHighlightsByPatientCallId(9).subscribe((result: any) => {
      expect(result[0].id).toBe('h1');
      expect(http.post).toHaveBeenCalledWith('patients/9/calls');
      done();
    });
  });

  it('handles errors', done => {
    const http = {
      post: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' })))
    } as any;
    const svc = new PatientCallNotesHighlightService(http as any);

    svc.getPatientCallNoteHighlightsByPatientCallId(3).subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toContain('alert-danger');
        done();
      }
    });
  });
});
