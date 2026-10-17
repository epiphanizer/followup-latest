import { of } from 'rxjs';
import { PatientSummaryWidgetComponent } from './patient-summary-widget.component';

const makePatientContactService = (contacts: any[]) => ({
  getPatientContactsByPatientId: jest.fn(() => of(contacts))
});

describe('PatientSummaryWidgetComponent (Jest)', () => {
  it('formats patient display phone and contact phone numbers', () => {
    const svc = makePatientContactService([{ patientContactPhoneNumber: '1234567' } as any]);
    const comp = new PatientSummaryWidgetComponent(svc as any);
    comp.patient = { patientId: 'p1', patientPhoneNumber: '1234567' } as any;

    comp.ngOnInit();

    expect(comp.patientDisplayPhone).toBe('123-4567');
    expect(comp.patientContacts[0].patientContactPhoneNumber).toBe('123-4567');
  });

  it('does not double-format already hyphenated contact numbers', () => {
    const contacts = [{ patientContactPhoneNumber: '987-6543' } as any];
    const svc = makePatientContactService(contacts);
    const comp = new PatientSummaryWidgetComponent(svc as any);
    comp.patient = { patientId: 'p2', patientPhoneNumber: '555-1234' } as any;

    comp.ngOnInit();

    expect(svc.getPatientContactsByPatientId).toHaveBeenCalledWith('p2');
    expect(comp.patientDisplayPhone).toBe('555-1234');
    expect(comp.patientContacts[0].patientContactPhoneNumber).toBe('987-6543');
  });

  it('dedupes repeated patient contacts and drops blank rows', () => {
    const svc = makePatientContactService([
      {
        patientContactFirstName: ' Ann ',
        patientContactLastName: 'Smith',
        patientContactRelationship: 'Daughter',
        patientContactCountryCode: '1',
        patientContactAreaCode: '480',
        patientContactPhoneNumber: '5551234',
        patientContactResponsiblePartyBoolean: false,
        patientContactHIPAABoolean: false
      } as any,
      {
        patientContactFirstName: 'ann',
        patientContactLastName: 'smith',
        patientContactRelationship: 'daughter',
        patientContactCountryCode: '1',
        patientContactAreaCode: '480',
        patientContactPhoneNumber: '555-1234',
        patientContactResponsiblePartyBoolean: true,
        patientContactHIPAABoolean: true
      } as any,
      {
        patientContactFirstName: ' ',
        patientContactLastName: '',
        patientContactRelationship: '',
        patientContactCountryCode: '',
        patientContactAreaCode: '',
        patientContactPhoneNumber: ''
      } as any
    ]);
    const comp = new PatientSummaryWidgetComponent(svc as any);
    comp.patient = { patientId: 'p5', patientPhoneNumber: '5551234' } as any;

    comp.ngOnInit();

    expect(comp.patientContacts).toHaveLength(1);
    expect(comp.patientContacts[0].patientContactPhoneNumber).toBe('555-1234');
    expect(comp.patientContacts[0].patientContactResponsiblePartyBoolean).toBe(true);
    expect(comp.patientContacts[0].patientContactHIPAABoolean).toBe(true);
  });

  it('builds fallback display phone when only 10-digit number is present', () => {
    const svc = makePatientContactService([]);
    const comp = new PatientSummaryWidgetComponent(svc as any);
    comp.patient = { patientId: 'p3', patientPhoneNumber: '(480) 555-1212' } as any;

    comp.ngOnInit();

    expect(comp.patientDisplayPhone).toBe('480-555-1212');
  });

  it('builds display phone with country fallback when 11-digit number is present', () => {
    const svc = makePatientContactService([]);
    const comp = new PatientSummaryWidgetComponent(svc as any);
    comp.patient = { patientId: 'p4', patientPhoneNumber: '16025551212' } as any;

    comp.ngOnInit();

    expect(comp.patientDisplayPhone).toBe('1-602-555-1212');
  });

  it('toggles alternate numbers', () => {
    const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);
    comp.patient = { patientId: 'p1' } as any;

    comp.toggleAlternateNumbers();
    expect(comp.expandAlternateNumbers).toBe(true);
    comp.toggleAlternateNumbers();
    expect(comp.expandAlternateNumbers).toBe(false);
  });

  it('reuses preloaded patient.patientContacts$ without invoking contact service again', () => {
    const preloadedContacts = [{ patientContactPhoneNumber: '480-555-1234' } as any];
    const svc = makePatientContactService([]);
    const comp = new PatientSummaryWidgetComponent(svc as any);
    comp.patient = {
      patientId: 'p-preloaded',
      patientPhoneNumber: '4805551234',
      patientContacts$: of(preloadedContacts)
    } as any;

    comp.ngOnInit();

    expect(svc.getPatientContactsByPatientId).not.toHaveBeenCalled();
    expect(comp.patientContacts[0].patientContactPhoneNumber).toBe('480-555-1234');
  });

  describe('getContactDisplayPhone', () => {
    it('formats 7-digit contact number with area code', () => {
      const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);
      const formatted = comp.getContactDisplayPhone({
        patientContactAreaCode: '480',
        patientContactPhoneNumber: '5551234'
      } as any);

      expect(formatted).toBe('480-555-1234');
    });

    it('formats 10-digit contact number when area code is not separated', () => {
      const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);
      const formatted = comp.getContactDisplayPhone({
        patientContactAreaCode: '',
        patientContactPhoneNumber: '4805551234'
      } as any);

      expect(formatted).toBe('480-555-1234');
    });

    it('prevents duplicate area codes when phone already includes the area code', () => {
      const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);
      const formatted = comp.getContactDisplayPhone({
        patientContactAreaCode: '480',
        patientContactPhoneNumber: '480-555-1234'
      } as any);

      expect(formatted).toBe('480-555-1234');
    });

    it('formats 7-digit local number without area code', () => {
      const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);
      const formatted = comp.getContactDisplayPhone({
        patientContactAreaCode: '',
        patientContactPhoneNumber: '555-1234'
      } as any);

      expect(formatted).toBe('555-1234');
    });

    it('returns empty string for missing or blank phone numbers', () => {
      const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);

      expect(comp.getContactDisplayPhone(null as any)).toBe('');
      expect(comp.getContactDisplayPhone({ patientContactPhoneNumber: '' } as any)).toBe('');
      expect(comp.getContactDisplayPhone({ patientContactAreaCode: '480', patientContactPhoneNumber: '' } as any)).toBe('');
    });

    it('includes non-US country code when provided', () => {
      const comp = new PatientSummaryWidgetComponent(makePatientContactService([]) as any);
      const formatted = comp.getContactDisplayPhone({
        patientContactCountryCode: '44',
        patientContactAreaCode: '20',
        patientContactPhoneNumber: '79460919'
      } as any);

      expect(formatted).toBe('44-20-794-60919');
    });
  });
});
