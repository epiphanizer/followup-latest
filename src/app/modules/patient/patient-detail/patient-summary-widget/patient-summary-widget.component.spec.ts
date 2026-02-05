import { of } from 'rxjs';
import { PatientSummaryWidgetComponent } from './patient-summary-widget.component';

const makePatientContactService = (contacts: any[]) => ({
  getPatientContactsByPatientId: jest.fn(() => of(contacts))
});

describe('PatientSummaryWidgetComponent (Jest)', () => {
  it('formats patient and contact phone numbers', () => {
    const svc = makePatientContactService([{ patientContactPhoneNumber: '1234567' } as any]);
    const comp = new PatientSummaryWidgetComponent(svc as any);
    comp.patient = { patientId: 'p1', patientPhoneNumber: '1234567' } as any;

    comp.ngOnInit();

    expect(comp.patient.patientPhoneNumber).toBe('123-4567');
    expect(comp.patientContacts[0].patientContactPhoneNumber).toBe('123-4567');
  });

  it('toggles alternate numbers', () => {
    const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);
    comp.patient = { patientId: 'p1' } as any;

    comp.toggleAlternateNumbers();
    expect(comp.expandAlternateNumbers).toBe(true);
    comp.toggleAlternateNumbers();
    expect(comp.expandAlternateNumbers).toBe(false);
  });
});
