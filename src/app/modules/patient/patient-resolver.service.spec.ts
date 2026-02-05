import { of } from 'rxjs';
import { PatientResolver } from './patient-resolver.service';

const makeRoute = (patientId: string) => ({
  paramMap: {
    get: jest.fn(() => patientId)
  }
});

describe('PatientResolver (Jest)', () => {
  it('fetches patient and wires dependent streams', async () => {
    const patientService = {
      getPatientByPatientId: jest.fn(() => of([{ patientId: 'p-1' } as any])),
      getPatientLanguagesByPatientId: jest.fn(() => of(['en']))
    } as any;
    const patientContactService = {
      getPatientContactsByPatientId: jest.fn(() => of(['contact']))
    } as any;
    const patientCallService = {
      getPatientCallsByPatientId: jest.fn(() => of(['call']))
    } as any;
    const resolver = new PatientResolver(patientService, patientCallService, patientContactService);

    const result = await resolver.resolve(makeRoute('p-1') as any).toPromise();

    expect(patientService.getPatientByPatientId).toHaveBeenCalledWith('p-1');
    expect(result.patientId).toBe('p-1');
    expect(await result.patientLanguages$.toPromise()).toEqual(['en']);
    expect(await result.patientContacts$.toPromise()).toEqual(['contact']);
    expect(await result.patientCalls$.toPromise()).toEqual(['call']);
  });
});
