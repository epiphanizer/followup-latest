import { of } from 'rxjs';
import { PatientIntakeQuestionService } from './patient-intake-question.service';

describe('PatientIntakeQuestionService (Jest)', () => {
  const makeHttp = () => ({
    post: jest.fn(() => of({ created: true } as any)),
    put: jest.fn(() => of({ updated: true } as any)),
    get: jest.fn(() => of([{ id: 'q1' }] as any))
  });

  it('adds intake question answer', () => {
    const http = makeHttp();
    const svc = new PatientIntakeQuestionService(http as any);

    svc.addPatientIntakeQuestionAnswerByPatientIntakeQuestionId('q-1', 'yes').subscribe((result: any) => {
      expect(result).toEqual({ created: true } as any);
    });

    expect(http.post).toHaveBeenCalledWith('patients/questions/q-1/answers', { patientIntakeQuestionAnswer: 'yes' });
  });

  it('edits intake question answer', () => {
    const http = makeHttp();
    const svc = new PatientIntakeQuestionService(http as any);

    svc.editPatientIntakeQuestionAnswerByPatientIntakeQuestionId('q-2', 'no').subscribe((result: any) => {
      expect(result).toEqual({ updated: true } as any);
    });

    expect(http.put).toHaveBeenCalledWith('patients/questions/q-2/answers', { patientIntakeQuestionAnswer: 'no' });
  });

  it('gets intake questions by patient id', () => {
    const http = makeHttp();
    const svc = new PatientIntakeQuestionService(http as any);

    svc.getPatientIntakeQuestionsByPatientId('p1').subscribe((result: any) => {
      expect(result).toEqual([{ id: 'q1' }] as any);
    });

    expect(http.get).toHaveBeenCalledWith('patients/p1/questions');
  });

  it('gets intake question answers by question id', () => {
    const http = makeHttp();
    const svc = new PatientIntakeQuestionService(http as any);

    svc.getPatientIntakeQuestionAnswersByPatientIntakeQuestionId('q3').subscribe((result: any) => {
      expect(result).toEqual([{ id: 'q1' }] as any);
    });

    expect(http.get).toHaveBeenCalledWith('patients/questions/q3/answers');
  });
});
