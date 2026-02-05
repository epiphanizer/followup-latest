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
    getPatientByPatientId: jest.fn(() => of([{ patientId: 'p-edit', patientMedicalConditions: '{}' }] as any))
  } as any;
  const patientContactService = {
    getPatientContactsByPatientId: jest.fn(() => of([]))
  } as any;
  const patientIntakeQuestionService = {
    getPatientIntakeQuestionsByPatientId: jest.fn(() => of([])),
    getPatientIntakeQuestionAnswersByPatientIntakeQuestionId: jest.fn(() => of(null))
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
});
