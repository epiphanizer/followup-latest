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

  it('exposes stored hospital information for the left-hand patient labels', () => {
    const comp = new PatientNotesComponent({} as any);

    comp.patient = { patientHospitalAdmitted: ' General Hospital ' } as any;
    expect(comp.hospitalInfo).toBe('General Hospital');

    comp.patient = { patientPrimaryInsurance: 'Legacy Hospital' } as any;
    expect(comp.hospitalInfo).toBe('Legacy Hospital');

    comp.patient = { patientHospitalAdmitted: ' ' } as any;
    expect(comp.hospitalInfo).toBe('');
  });

  it('preserves full-length hospital names up to 255 characters without truncation', () => {
    const comp = new PatientNotesComponent({} as any);
    const longHospitalName =
      'Banner - University Medical Center Phoenix Campus - Specialized Acute Care and Comprehensive Regional Trauma Center & Teaching Hospital Department of Intensive Post-Operative Recovery and Follow-Up Rehabilitation Facility Phoenix Division';
    comp.patient = { patientHospitalAdmitted: longHospitalName } as any;
    expect(comp.hospitalInfo).toBe(longHospitalName);
    expect(comp.hospitalInfo.length).toBeGreaterThan(150);
    expect(comp.hospitalInfo.length).toBeLessThanOrEqual(255);
  });
});
