import { firstValueFrom, of } from 'rxjs';
import { PatientResolver } from './patient-resolver.service';

const makeRoute = (patientId: string) => ({
  paramMap: {
    get: jest.fn(() => patientId)
  }
});

describe('PatientResolver (Jest)', () => {
  it('fetches patient and wires dependent streams', async () => {
    const patientService = {
      getPatientByPatientId: jest.fn(() => of({ patientId: 'p-1' } as any)),
      getPatientLanguagesByPatientId: jest.fn(() => of(['en']))
    } as any;
    const patientContactService = {
      getPatientContactsByPatientId: jest.fn(() => of(['contact']))
    } as any;
    const patientCallService = {
      getPatientCallsByPatientId: jest.fn(() => of(['call']))
    } as any;
    const resolver = new PatientResolver(patientService, patientCallService, patientContactService);

    const result = await firstValueFrom(resolver.resolve(makeRoute('p-1') as any));

    expect(patientService.getPatientByPatientId).toHaveBeenCalledWith('p-1');
    expect(result.patientId).toBe('p-1');
    expect(await firstValueFrom(result.patientLanguages$)).toEqual(['en']);
    expect(await firstValueFrom(result.patientContacts$)).toEqual(['contact']);
    expect(await firstValueFrom(result.patientCalls$)).toEqual(['call']);
  });
});
