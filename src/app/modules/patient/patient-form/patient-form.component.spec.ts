import { FormArray, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { PatientFormComponent } from './patient-form.component';

const baseUser = {
  operations: [{ operationId: 'op-1' }],
  operationGroups: [{ operationGroupId: 'og-1', operations: [{ operationId: 'op-1' }] }]
} as any;

const makeServices = (overrides?: any) => {
  const patientService = {
    getPatientDischargeLabels: jest.fn(() => of([])),
    addNewPatient: jest.fn(() => of({ patientId: 'new-p' } as any)),
    getPatientByPatientId: jest.fn(() => of([{ patientId: 'p-edit', patientMedicalConditions: '{}' }] as any)),
    deletePatientByPatientId: jest.fn(() => of(null)),
    editPatientByPatientId: jest.fn(() => of(true))
  } as any;
  const patientContactService = {
    getPatientContactsByPatientId: jest.fn(() => of([]))
  } as any;
  const patientIntakeQuestionService = {
    getPatientIntakeQuestionsByPatientId: jest.fn(() => of([])),
    getPatientIntakeQuestionAnswersByPatientIntakeQuestionId: jest.fn(() => of(null)),
    addPatientIntakeQuestionAnswerByPatientIntakeQuestionId: jest.fn(() => of(null)),
    editPatientIntakeQuestionAnswerByPatientIntakeQuestionId: jest.fn(() => of(null))
  } as any;
  const toastrService = { success: jest.fn() } as any;
  const userService = { updateOperations: jest.fn(() => Promise.resolve()) } as any;
  return {
    patientService,
    patientContactService,
    patientIntakeQuestionService,
    toastrService,
    userService,
    ...(overrides || {})
  };
};

describe('PatientFormComponent (Jest)', () => {
  it('initializes add mode and builds form defaults', async () => {
    const route = { snapshot: { data: { mode: 'add', user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );

    comp.ngOnInit();
    await Promise.resolve();

    expect(comp.mode.add).toBe(true);
    expect(services.patientService.addNewPatient).toHaveBeenCalled();
    expect(comp.patientForm).toBeTruthy();
    expect(comp.patientForm.get('patient.dischargeInfo.patientDischargedTo').value).toBe('2PEXyKgz');
  });

  it('initializes edit mode and sets patient data', async () => {
    const patient = {
      patientId: 'p-edit',
      patientOperationId: 'op-1',
      patientMedicalRecordNumber: 'mrn',
      patientFirstName: 'John',
      patientLastName: 'Doe',
      patientDob: '2020-01-01',
      patientGender: 'M',
      patientMedicalConditions: JSON.stringify({
        cardiacBoolean: true,
        sepsisBoolean: false,
        pulmonaryBoolean: false,
        otherBoolean: false
      }),
      patientAdmitDate: '2020-01-01',
      patientDischargeDate: '2020-01-02',
      patientDischargeLabelId: 'lbl-1'
    } as any;
    const route = { snapshot: { data: { mode: 'edit', user: baseUser, patient } } } as any;
    const services = makeServices({
      patientService: {
        getPatientDischargeLabels: jest.fn(() => of([])),
        getPatientByPatientId: jest.fn(() => of([patient])),
        addNewPatient: jest.fn()
      } as any
    });
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );

    comp.ngOnInit();
    await Promise.resolve();

    expect(comp.mode.edit).toBe(true);
    expect(services.patientService.getPatientByPatientId).toHaveBeenCalledWith('p-edit');
    expect(comp.patientForm).toBeTruthy();
    expect(comp.patientForm.get('patient.dischargeInfo.patientDischargedTo').value).toBe('lbl-1');
  });

  it('adds additional patient contact to form', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = {
      patientOperationId: 'op-1',
      patientMedicalRecordNumber: 'mrn',
      patientFirstName: 'A',
      patientLastName: 'B',
      patientDob: '2020-01-01',
      patientGender: 'M',
      patientMedicalConditions: {
        cardiacBoolean: false,
        sepsisBoolean: false,
        pulmonaryBoolean: false,
        otherBoolean: false
      },
      patientAdmitDate: '2020-01-01',
      patientDischargeDate: '2020-01-02',
      patientDischargeLabelId: 'lbl-1',
      patientTotalDays: 1
    } as any;

    (comp as any).createForm();
    comp.addAdditionalPatientContact();

    expect(comp.patientContacts.length).toBe(1);
    expect((comp.patientForm.get('patient.patientContacts') as FormArray).length).toBe(1);
    expect(comp.patientContacts[0].patientContactOrder).toBe('1');
  });

  it('updates discharge fields and total days', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = {
      patientOperationId: 'op-1',
      patientMedicalRecordNumber: 'mrn',
      patientFirstName: 'A',
      patientLastName: 'B',
      patientDob: '2020-01-01',
      patientGender: 'M',
      patientMedicalConditions: {
        cardiacBoolean: false,
        sepsisBoolean: false,
        pulmonaryBoolean: false,
        otherBoolean: false
      },
      patientAdmitDate: '2020-01-01',
      patientDischargeDate: '2020-01-02',
      patientDischargeLabelId: 'lbl-1',
      patientTotalDays: 1
    } as any;

    (comp as any).createForm();
    comp.patientForm.get('patient.dischargeInfo.patientAdmitDate').setValue('2020-01-01');
    comp.patientForm.get('patient.dischargeInfo.patientDischargeDate').setValue('2020-01-02');

    comp.updateDischargeFields();

    expect(comp.patientMaxAdmitDate).toBe('2020-01-02');
    expect(comp.patientMinDischargeDate).toBe('2020-01-01');
    expect(comp.patientForm.get('patient.dischargeInfo.patientTotalDays').value).toBe(1);
  });

  it('explicitly clears language state from the form', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = {
      patientOperationId: 'op-1',
      patientMedicalRecordNumber: 'mrn',
      patientFirstName: 'A',
      patientLastName: 'B',
      patientDob: '2020-01-01',
      patientGender: 'M',
      patientMedicalConditions: {
        cardiacBoolean: false,
        sepsisBoolean: false,
        pulmonaryBoolean: false,
        otherBoolean: false
      },
      patientAdmitDate: '2020-01-01',
      patientDischargeDate: '2020-01-02',
      patientDischargeLabelId: 'lbl-1',
      patientTotalDays: 1,
      patientSpeaksEnglish: false,
      patientFluentLanguage: 'Spanish'
    } as any;

    (comp as any).createForm();
    expect(comp.patientForm.get('patient.patientSpeaksEnglish').value).toBe(true);
    expect(comp.patientForm.get('patient.patientFluentLanguage').value).toBe('Spanish');

    comp.clearPatientFluentLanguage();

    expect(comp.patientForm.get('patient.patientSpeaksEnglish').value).toBe(false);
    expect(comp.patientForm.get('patient.patientFluentLanguage').value).toBe('');
  });

  it('selects patient contact relationship', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    const patientContact = { patientContactRelationship: '' } as any;

    comp.selectPatientContactRelationship('Friend', patientContact);

    expect(patientContact.patientContactRelationship).toBe('Friend');
  });

  it('removes a patient contact and tracks removal list', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = {
      patientOperationId: 'op-1',
      patientMedicalRecordNumber: 'mrn',
      patientFirstName: 'A',
      patientLastName: 'B',
      patientDob: '2020-01-01',
      patientGender: 'M',
      patientMedicalConditions: {
        cardiacBoolean: false,
        sepsisBoolean: false,
        pulmonaryBoolean: false,
        otherBoolean: false
      },
      patientAdmitDate: '2020-01-01',
      patientDischargeDate: '2020-01-02',
      patientDischargeLabelId: 'lbl-1',
      patientTotalDays: 1
    } as any;

    (comp as any).createForm();
    comp.addAdditionalPatientContact();
    comp.patientContacts[0].patientContactId = 'pc-1';

    comp.removeAdditionalPatientContact(0);

    expect(comp.patientContactsToRemove).toEqual(['pc-1']);
    expect(comp.patientContacts.length).toBe(0);
  });

  it('builds a patient contact put payload with coercions', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );

    const payload = comp.patientContactPutFactory({
      patientContactId: 'pc-1',
      patientContactFirstName: 'Ann',
      patientContactLastName: 'Smith',
      patientContactRelationship: 'Friend',
      patientContactCountryCode: '1',
      patientContactAreaCode: '212',
      patientContactPhoneNumber: '5551234',
      patientContactOrder: '2',
      patientContactHIPAABoolean: true,
      patientContactResponsiblePartyBoolean: false
    } as any);

    expect(payload).toEqual({
      patientContactId: 'pc-1',
      patientContactFirstName: 'Ann',
      patientContactLastName: 'Smith',
      patientContactRelationship: 'Friend',
      patientContactCountryCode: '1',
      patientContactAreaCode: '212',
      patientContactPhoneNumber: '5551234',
      patientContactOrder: 2,
      patientContactHIPAABoolean: 1,
      patientContactResponsiblePartyBoolean: 0
    });
  });

  it('builds a patient contact post payload using patientId', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = { patientId: 'p-1' } as any;

    const payload = comp.patientContactPostFactory({
      patientContactFirstName: 'Ann',
      patientContactLastName: 'Smith',
      patientContactRelationship: 'Friend',
      patientContactCountryCode: '1',
      patientContactAreaCode: '212',
      patientContactPhoneNumber: '5551234',
      patientContactOrder: '2',
      patientContactHIPAABoolean: true,
      patientContactResponsiblePartyBoolean: false
    } as any);

    expect(payload).toEqual({
      patientId: 'p-1',
      patientContactFirstName: 'Ann',
      patientContactLastName: 'Smith',
      patientContactRelationship: 'Friend',
      patientContactCountryCode: '1',
      patientContactAreaCode: '212',
      patientContactPhoneNumber: '5551234',
      patientContactOrder: 2,
      patientContactHIPAABoolean: 1,
      patientContactResponsiblePartyBoolean: 0
    });
  });

  it('creates a form submission payload with cleared language when patient speaks english', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );

    const formSubmission: any = {
      patient: {
        patientDob: '2021-01-01',
        operation: 'op-1',
        patientMedicalRecordNumber: 'mrn',
        patientName: { patientFirstName: 'John', patientLastName: 'Doe' },
        patientCountryCode: '1',
        patientAreaCode: '212',
        patientPhoneNumber: '5551234',
        patientGender: 'M',
        patientHIPAA: true,
        patientIsResponsibleParty: false,
        patientSpeaksEnglish: false,
        patientFluentLanguage: 'Spanish',
        primaryCarePhysician: {
          patientPhysicianName: 'Dr. House',
          patientPhysicianPhoneNumber: '111'
        },
        insurance: {
          primaryInsurance: 'Aetna'
        },
        dischargeInfo: {
          patientAdmitDate: '2021-01-02',
          patientDischargeDate: '2021-01-03',
          patientDischargedAma: true,
          patientDischargedTo: 'lbl-1'
        },
        patientMedicalConditions: {
          cardiacBoolean: 1,
          sepsisBoolean: 0,
          pulmonaryBoolean: 0,
          otherBoolean: 1
        },
        patientDischargedCondition: 'Stable',
        patientPrimaryDiagnosis: 'DX',
        patientIntakeQuestionAnswers: [],
        patientNeedToKnow: 'notes',
        patientActive: true
      }
    };

    const payload = (comp as any).formSubmissionFactory(formSubmission);

    expect(payload).toEqual({
      patientDob: '2021-01-01T12:00:00.00Z',
      patientOperationId: 'op-1',
      patientMedicalRecordNumber: 'mrn',
      patientFirstName: 'John',
      patientLastName: 'Doe',
      patientCountryCode: '1',
      patientAreaCode: '212',
      patientPhoneNumber: '5551234',
      patientGender: 'M',
      patientHIPAA: 1,
      patientIsResponsibleParty: 0,
      patientSpeaksEnglish: 1,
      patientFluentLanguage: '',
      patientPhysicianName: 'Dr. House',
      patientPhysicianPhoneNumber: '111',
      patientPrimaryInsurance: 'Aetna',
      patientAdmitDate: '2021-01-02T12:00:00.00Z',
      patientDischargeDate: '2021-01-03T12:00:00.00Z',
      patientDischargedAma: 1,
      patientDischargeLabelId: 'lbl-1',
      patientDischargedCondition: 'Stable',
      patientPrimaryDiagnosis: 'DX',
      patientMedicalConditions: JSON.stringify({
        cardiacBoolean: 1,
        sepsisBoolean: 0,
        pulmonaryBoolean: 0,
        otherBoolean: 1
      }),
      patientNeedToKnow: 'notes',
      patientActive: 1
    });
  });

  it('creates a form submission payload with selected language when patient does not speak english', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );

    const formSubmission: any = {
      patient: {
        patientDob: '2021-01-01',
        operation: 'op-1',
        patientMedicalRecordNumber: 'mrn',
        patientName: { patientFirstName: 'John', patientLastName: 'Doe' },
        patientCountryCode: '1',
        patientAreaCode: '212',
        patientPhoneNumber: '5551234',
        patientGender: 'M',
        patientHIPAA: true,
        patientIsResponsibleParty: false,
        patientSpeaksEnglish: true,
        patientFluentLanguage: 'Spanish',
        primaryCarePhysician: {
          patientPhysicianName: 'Dr. House',
          patientPhysicianPhoneNumber: '111'
        },
        insurance: {
          primaryInsurance: 'Aetna'
        },
        dischargeInfo: {
          patientAdmitDate: '2021-01-02',
          patientDischargeDate: '2021-01-03',
          patientDischargedAma: true,
          patientDischargedTo: 'lbl-1'
        },
        patientMedicalConditions: {
          cardiacBoolean: 1,
          sepsisBoolean: 0,
          pulmonaryBoolean: 0,
          otherBoolean: 1
        },
        patientDischargedCondition: 'Stable',
        patientPrimaryDiagnosis: 'DX',
        patientIntakeQuestionAnswers: [],
        patientNeedToKnow: 'notes',
        patientActive: true
      }
    };

    const payload = (comp as any).formSubmissionFactory(formSubmission);

    expect(payload).toEqual(
      expect.objectContaining({
        patientSpeaksEnglish: 0,
        patientFluentLanguage: 'Spanish'
      })
    );
  });

  it('edits patient and forwards selected language payload to the API call', async () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = { patientId: 'p-123' } as any;
    comp.user = { id: 'u-1' } as any;
    comp.mode.edit = true;
    comp.patientForm = new FormBuilder().group({
      patient: new FormBuilder().group({
        operation: new FormBuilder().control('op-1')
      })
    });
    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: '', reload: jest.fn() } as any;
    Object.defineProperty(window, 'location', { configurable: true, value: mockLocation });

    const formSubmission: any = {
      patient: {
        patientDob: '2021-01-01',
        operation: 'op-1',
        patientMedicalRecordNumber: 'mrn',
        patientName: { patientFirstName: 'John', patientLastName: 'Doe' },
        patientCountryCode: '1',
        patientAreaCode: '212',
        patientPhoneNumber: '5551234',
        patientGender: 'M',
        patientHIPAA: true,
        patientIsResponsibleParty: false,
        patientSpeaksEnglish: true,
        patientFluentLanguage: 'Spanish',
        primaryCarePhysician: {
          patientPhysicianName: 'Dr. House',
          patientPhysicianPhoneNumber: '111'
        },
        insurance: {
          primaryInsurance: 'Aetna'
        },
        dischargeInfo: {
          patientAdmitDate: '2021-01-02',
          patientDischargeDate: '2021-01-03',
          patientDischargedAma: true,
          patientDischargedTo: 'lbl-1'
        },
        patientMedicalConditions: {
          cardiacBoolean: 1,
          sepsisBoolean: 0,
          pulmonaryBoolean: 0,
          otherBoolean: 1
        },
        patientDischargedCondition: 'Stable',
        patientPrimaryDiagnosis: 'DX',
        patientIntakeQuestionAnswers: [],
        patientNeedToKnow: 'notes',
        patientActive: true
      }
    };

    comp.editPatient(formSubmission);
    await Promise.resolve();

    expect(services.patientService.editPatientByPatientId).toHaveBeenCalledWith(
      'p-123',
      expect.objectContaining({
        patientOperationId: 'op-1',
        patientSpeaksEnglish: 0,
        patientFluentLanguage: 'Spanish'
      })
    );
    expect(services.userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect((window.location as any).href).toContain('/operations/op-1/patients');

    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('sends cleared language payload to the API call in create save path', async () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = { patientId: 'p-123' } as any;
    comp.user = { id: 'u-1' } as any;
    comp.mode.edit = false;
    comp.patientForm = new FormBuilder().group({
      patient: new FormBuilder().group({
        operation: new FormBuilder().control('op-1')
      })
    });
    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: '', reload: jest.fn() } as any;
    Object.defineProperty(window, 'location', { configurable: true, value: mockLocation });

    const formSubmission: any = {
      patient: {
        patientDob: '2021-01-01',
        operation: 'op-1',
        patientMedicalRecordNumber: 'mrn',
        patientName: { patientFirstName: 'John', patientLastName: 'Doe' },
        patientCountryCode: '1',
        patientAreaCode: '212',
        patientPhoneNumber: '5551234',
        patientGender: 'M',
        patientHIPAA: true,
        patientIsResponsibleParty: false,
        patientSpeaksEnglish: false,
        patientFluentLanguage: 'Spanish',
        primaryCarePhysician: {
          patientPhysicianName: 'Dr. House',
          patientPhysicianPhoneNumber: '111'
        },
        insurance: {
          primaryInsurance: 'Aetna'
        },
        dischargeInfo: {
          patientAdmitDate: '2021-01-02',
          patientDischargeDate: '2021-01-03',
          patientDischargedAma: true,
          patientDischargedTo: 'lbl-1'
        },
        patientMedicalConditions: {
          cardiacBoolean: 1,
          sepsisBoolean: 0,
          pulmonaryBoolean: 0,
          otherBoolean: 1
        },
        patientDischargedCondition: 'Stable',
        patientPrimaryDiagnosis: 'DX',
        patientIntakeQuestionAnswers: [],
        patientNeedToKnow: 'notes',
        patientActive: true
      }
    };

    comp.editPatient(formSubmission);
    await Promise.resolve();

    expect(services.patientService.editPatientByPatientId).toHaveBeenCalledWith(
      'p-123',
      expect.objectContaining({
        patientOperationId: 'op-1',
        patientSpeaksEnglish: 1,
        patientFluentLanguage: ''
      })
    );
    expect(services.userService.updateOperations).toHaveBeenCalledWith(comp.user);

    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('validates controls and returns flags based on DOM', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    document.body.innerHTML = '';
    expect(comp.validateControls()).toBe(true);

    document.body.innerHTML = '<ion-item><div class="ng-invalid"></div></ion-item>';
    expect(comp.validateControls()).toBe(false);
    expect(alertSpy).toHaveBeenCalled();

    alertSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('reloads the page on cancel', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    const originalLocation = window.location;
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock }
    });

    comp.cancel();

    expect(reloadMock).toHaveBeenCalled();
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('aborts submit when validation fails', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    jest.spyOn(comp, 'validateControls').mockReturnValue(false);

    comp.onFormSubmit();

    expect(
      services.patientIntakeQuestionService.addPatientIntakeQuestionAnswerByPatientIntakeQuestionId
    ).not.toHaveBeenCalled();
  });

  it('skips delete when not confirmed', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = { patientId: 'p-1', patientOperationId: 'op-1' } as any;
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    comp.deletePatient(1);

    expect(services.patientService.deletePatientByPatientId).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('deletes patient when confirmed and redirects', async () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = { patientId: 'p-1', patientOperationId: 'op-1' } as any;
    comp.user = { id: 'u-1' } as any;
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: '', reload: jest.fn() } as any;
    Object.defineProperty(window, 'location', { configurable: true, value: mockLocation });

    comp.deletePatient(1);
    await Promise.resolve();

    expect(services.patientService.deletePatientByPatientId).toHaveBeenCalledWith('p-1');
    expect(services.userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect((window.location as any).href).toContain('/operations/op-1/patients');

    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    confirmSpy.mockRestore();
  });

  it('clears patient on destroy', () => {
    const route = { snapshot: { data: { user: baseUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService
    );
    comp.patient = { patientId: 'p-1' } as any;

    comp.ngOnDestroy();

    expect(comp.patient).toBeNull();
  });
});
