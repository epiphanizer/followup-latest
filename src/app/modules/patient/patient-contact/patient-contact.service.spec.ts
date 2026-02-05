import { of } from 'rxjs';
import { PatientContactService } from './patient-contact.service';

describe('PatientContactService (Jest)', () => {
  const makeHttp = () => ({
    get: jest.fn(() => of([{ id: 'c1' }] as any)),
    post: jest.fn(() => of({ created: true } as any)),
    put: jest.fn(() => of({ updated: true } as any)),
    delete: jest.fn(() => of({ deleted: true } as any))
  });

  it('gets contacts by patient id', () => {
    const http = makeHttp();
    const svc = new PatientContactService(http as any);

    svc.getPatientContactsByPatientId('p1').subscribe((result: any) => {
      expect(result).toEqual([{ id: 'c1' }] as any);
    });

    expect(http.get).toHaveBeenCalledWith('patients/p1/contacts/');
  });

  it('adds a patient contact', () => {
    const http = makeHttp();
    const svc = new PatientContactService(http as any);

    svc.addNewPatientContactByPatientId('p2', { name: 'x' } as any).subscribe((result: any) => {
      expect(result).toEqual({ created: true } as any);
    });

    expect(http.post).toHaveBeenCalledWith('patients/p2/contacts', { name: 'x' } as any);
  });

  it('edits a patient contact', () => {
    const http = makeHttp();
    const svc = new PatientContactService(http as any);

    svc.editPatientContactByPatientId('c3', { name: 'y' } as any).subscribe((result: any) => {
      expect(result).toEqual({ updated: true } as any);
    });

    expect(http.put).toHaveBeenCalledWith('patients/contacts/c3', { name: 'y' } as any);
  });

  it('removes a patient contact', () => {
    const http = makeHttp();
    const svc = new PatientContactService(http as any);

    svc.removePatientContactByPatientContactId('c4').subscribe((result: any) => {
      expect(result).toEqual({ deleted: true } as any);
    });

    expect(http.delete).toHaveBeenCalledWith('patients/contacts/c4');
  });
});
