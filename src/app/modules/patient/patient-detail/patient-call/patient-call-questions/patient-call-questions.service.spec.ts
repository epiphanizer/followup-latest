import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PatientCallQuestionsService } from './patient-call-questions.service';

describe('PatientCallQuestionsService (Jest)', () => {
  it('gets questions by patient call id', done => {
    const http = { get: jest.fn(() => of([{ id: 'q1' }] as any)) } as any;
    const svc = new PatientCallQuestionsService(http as any);

    svc.getPatientCallQuestionsByPatientCallId('pc1').subscribe((result: any) => {
      expect(result[0].id).toBe('q1');
      expect(http.get).toHaveBeenCalledWith('patients/calls/pc1/questions');
      done();
    });
  });

  it('adds question answer by question id', done => {
    const http = { post: jest.fn(() => of({ created: true } as any)) } as any;
    const svc = new PatientCallQuestionsService(http as any);

    svc.addPatientCallQuestionAnswersByPatientCallQuestionId('q-2', 'yes').subscribe((result: any) => {
      expect(result).toEqual({ created: true });
      expect(http.post).toHaveBeenCalledWith('patients/calls/questions/q-2/answers', {
        patientCallQuestionAnswer: 'yes'
      });
      done();
    });
  });

  it('gets answers by question id', done => {
    const http = { get: jest.fn(() => of([{ answer: 'a1' }] as any)) } as any;
    const svc = new PatientCallQuestionsService(http as any);

    svc.getPatientCallQuestionAnswersByPatientCallQuestionId('q-3').subscribe((result: any) => {
      expect(result[0].answer).toBe('a1');
      expect(http.get).toHaveBeenCalledWith('patients/calls/questions/q-3/answers');
      done();
    });
  });

  it('handles errors', done => {
    const http = { get: jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500, error: 'fail' }))) } as any;
    const svc = new PatientCallQuestionsService(http as any);

    svc.getPatientCallQuestionsByPatientCallId('pc2').subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toContain('alert-danger');
        done();
      }
    });
  });
});
