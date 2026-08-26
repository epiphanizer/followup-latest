import { of } from 'rxjs';
import { PatientIntakeQuestionService } from './patient-intake-question.service';
import { SKIP_GLOBAL_LOADER } from '@app/shared/interceptors/loader-interceptor';

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

    expect(http.get).toHaveBeenCalledWith(
      'patients/p1/questions',
      expect.objectContaining({ context: expect.anything() })
    );
    const requestOptions = (http.get as jest.Mock).mock.calls[0][1] as any;
    expect(requestOptions.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
  });

  it('gets intake question answers by question id', () => {
    const http = makeHttp();
    const svc = new PatientIntakeQuestionService(http as any);

    svc.getPatientIntakeQuestionAnswersByPatientIntakeQuestionId('q3').subscribe((result: any) => {
      expect(result).toEqual([{ id: 'q1' }] as any);
    });

    expect(http.get).toHaveBeenCalledWith(
      'patients/questions/q3/answers',
      expect.objectContaining({ context: expect.anything() })
    );
    const requestOptions = (http.get as jest.Mock).mock.calls[0][1] as any;
    expect(requestOptions.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
  });
});
