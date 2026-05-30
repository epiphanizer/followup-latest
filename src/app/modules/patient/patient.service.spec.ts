import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';

describe('PatientService (Jest)', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });

    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches patients by operation id', () => {
    const mockResponse = [{ patientId: 'p1' } as any];

    service.getPatientsByOperationId('op-1').subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('operations/op-1/patients/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('creates a new patient shell', () => {
    const mockPatient = { patientId: 'new-p' } as any;

    service.addNewPatient().subscribe(result => {
      expect(result).toEqual(mockPatient);
    });

    const req = httpMock.expectOne('patients');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockPatient);
  });

  it('deactivates patient by id', () => {
    const resp = { ok: true } as any;

    service.deactivatePatientByPatientId('p1').subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne('patients/p1/deactivate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(resp);
  });

  it('deletes patient by id', () => {
    const resp = { deleted: true } as any;

    service.deletePatientByPatientId('p2').subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne('patients/p2');
    expect(req.request.method).toBe('DELETE');
    req.flush(resp);
  });

  it('edits patient by id', () => {
    const body = { name: 'New' } as any;
    const resp = { patientId: 'p3' } as any;

    service.editPatientByPatientId('p3', body).subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne('patients/p3');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(body);
    req.flush(resp);
  });

  it('gets active spanish patients', () => {
    const resp = [{ id: 'p4' } as any];

    service.getActiveSpanishPatients().subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne('patients/spanish');
    expect(req.request.method).toBe('GET');
    req.flush(resp);
  });

  it('gets active patient list by operation', () => {
    const resp = [{ id: 'p5' } as any];

    service.getActivePatientListByOperationId('op-9').subscribe(result => {
      expect(result).toEqual(resp);
    });

    const req = httpMock.expectOne('operations/op-9/patients');
    expect(req.request.method).toBe('GET');
    req.flush(resp);
  });

  it('reuses cached active patient list requests for the same operation', () => {
    const resp = [{ id: 'p-cache' } as any];
    const results: any[] = [];

    service.getActivePatientListByOperationId('op-cache').subscribe(result => results.push(result));
    service.getActivePatientListByOperationId('op-cache').subscribe(result => results.push(result));

    const req = httpMock.expectOne('operations/op-cache/patients');
    expect(req.request.method).toBe('GET');
    req.flush(resp);

    service.getActivePatientListByOperationId('op-cache').subscribe(result => results.push(result));

    httpMock.expectNone('operations/op-cache/patients');
    expect(results).toEqual([resp, resp, resp]);
  });

  it('gets patient by id', () => {
    const resp = [{ patientId: 'p6' } as any];

    service.getPatientByPatientId('p6').subscribe(result => {
      expect(result).toEqual(resp as any);
    });

    const req = httpMock.expectOne('patients/p6');
    expect(req.request.method).toBe('GET');
    req.flush(resp as any);
  });

  it('fetches discharge labels', () => {
    const mockLabels = [
      { patientDischargeLabelId: 'l1', patientDischargeLabel: 'Home', patientDischargeLabelActive: 1 } as any,
      { patientDischargeLabelId: 'l2', patientDischargeLabel: 'Hospice', patientDischargeLabelActive: 0 } as any
    ];

    service.getPatientDischargeLabels().subscribe(result => {
      expect(result).toEqual([mockLabels[0]] as any);
    });

    const req = httpMock.expectOne('patients/discharge/labels');
    expect(req.request.method).toBe('GET');
    req.flush(mockLabels);
  });

  it('gets patient languages by patient id', () => {
    const mockLanguages = ['en'];

    service.getPatientLanguagesByPatientId('p1').subscribe(result => {
      expect(result).toEqual(mockLanguages as any);
    });

    const req = httpMock.expectOne('patients/p1/languages');
    expect(req.request.method).toBe('GET');
    req.flush(mockLanguages as any);
  });
});
