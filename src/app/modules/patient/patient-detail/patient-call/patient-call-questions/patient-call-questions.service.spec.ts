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

  it('hydrates questions with answers and reuses the cached result for the same call id', done => {
    const http = {
      get: jest.fn((url: string) => {
        if (url === 'patients/calls/pc-hydrated/questions') {
          return of([
            { patientCallQuestionId: 'q1', patientQuestionTypeLabel: 'rating' },
            {
              patientCallQuestionId: 'q2',
              patientQuestionTypeLabel: 'text',
              patientCallQuestionAnswer: 'already-there'
            }
          ] as any);
        }

        if (url === 'patients/calls/questions/q1/answers') {
          return of([{ patientCallQuestionAnswer: '5' }] as any);
        }

        return of([] as any);
      })
    } as any;
    const svc = new PatientCallQuestionsService(http as any);

    svc.getPatientCallQuestionsWithAnswersByPatientCallId('pc-hydrated').subscribe((firstResult: any) => {
      expect(firstResult[0].patientCallQuestionAnswer).toBe('5');
      expect(firstResult[1].patientCallQuestionAnswer).toBe('already-there');

      svc.getPatientCallQuestionsWithAnswersByPatientCallId('pc-hydrated').subscribe((secondResult: any) => {
        expect(secondResult[0].patientCallQuestionAnswer).toBe('5');
        expect(http.get).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  it('gets hydrated questions by patient id and reuses the cached result', done => {
    const http = { get: jest.fn(() => of([{ patientCallId: 'pc1', patientCallQuestionId: 'q1' }] as any)) } as any;
    const svc = new PatientCallQuestionsService(http as any);

    svc.getPatientCallQuestionsWithAnswersByPatientId('p1').subscribe((firstResult: any) => {
      expect(firstResult[0].patientCallId).toBe('pc1');

      svc.getPatientCallQuestionsWithAnswersByPatientId('p1').subscribe((secondResult: any) => {
        expect(secondResult[0].patientCallQuestionId).toBe('q1');
        expect(http.get).toHaveBeenCalledTimes(1);
        expect(http.get).toHaveBeenCalledWith('patients/p1/calls/questions');
        done();
      });
    });
  });

  it('clears patient-level hydrated cache after adding an answer', done => {
    const http = {
      get: jest.fn(() => of([{ patientCallId: 'pc1', patientCallQuestionId: 'q1' }] as any)),
      post: jest.fn(() => of({ created: true } as any))
    } as any;
    const svc = new PatientCallQuestionsService(http as any);

    svc.getPatientCallQuestionsWithAnswersByPatientId('p1').subscribe(() => {
      svc.addPatientCallQuestionAnswersByPatientCallQuestionId('q1', 'yes').subscribe(() => {
        svc.getPatientCallQuestionsWithAnswersByPatientId('p1').subscribe(() => {
          expect(http.get).toHaveBeenCalledTimes(2);
          done();
        });
      });
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
