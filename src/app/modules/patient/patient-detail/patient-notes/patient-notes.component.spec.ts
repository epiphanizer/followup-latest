import { of } from 'rxjs';
import { PatientNotesComponent } from './patient-notes.component';

describe('PatientNotesComponent (Jest)', () => {
  it('loads intake questions and answers and maps medical conditions', () => {
    const service = {
      getPatientIntakeQuestionsByPatientId: jest.fn(() => of([{ patientIntakeQuestionId: 'q1' }] as any)),
      getPatientIntakeQuestionAnswersByPatientIntakeQuestionId: jest.fn(() =>
        of([{ patientIntakeQuestionAnswer: 'yes', patientIntakeQuestionId: 'q1' }] as any)
      )
    } as any;
    const comp = new PatientNotesComponent(service);
    comp.patient = {
      patientId: 'p1',
      patientMedicalConditions: JSON.stringify({ cardiacBoolean: true, sepsisBoolean: false })
    } as any;

    comp.ngOnInit();

    expect(service.getPatientIntakeQuestionsByPatientId).toHaveBeenCalledWith('p1');
    expect(comp.patientIntakeQuestions[0].patientIntakeQuestionAnswer).toBe('yes');
    expect(comp.patientMedicalConditions).toContain('cardiacBoolean');
  });
});
