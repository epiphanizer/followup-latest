import { FormArray, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { PatientFormComponent } from './patient-form.component';

let facilityModalDismissResult: { data?: any; role?: string } = { role: 'cancel' };

const baseUser = {
  operations: [{ operationId: 'op-1', operationName: 'Facility One', operationGroupId: 'og-1' }],
  operationGroups: [
    {
      operationGroupId: 'og-1',
      operationGroupName: 'Client One',
      operations: [{ operationId: 'op-1', operationName: 'Facility One', operationGroupId: 'og-1' }]
    }
  ]
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
  const modalController = {
    create: jest.fn(() =>
      Promise.resolve({
        present: jest.fn(() => Promise.resolve()),
        onDidDismiss: jest.fn(() => Promise.resolve(facilityModalDismissResult))
      })
    )
  } as any;
  return {
    patientService,
    patientContactService,
    patientIntakeQuestionService,
    toastrService,
    userService,
    modalController,
    ...(overrides || {})
  };
};

describe('PatientFormComponent (Jest)', () => {
  beforeEach(() => {
    facilityModalDismissResult = { role: 'cancel' };
  });

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
      services.userService,
      services.modalController
    );

    comp.ngOnInit();
    await Promise.resolve();

    expect(comp.mode.add).toBe(true);
    expect(services.patientService.addNewPatient).toHaveBeenCalled();
    expect(comp.patientForm).toBeTruthy();
    expect(comp.groupedOperations.map(group => group.label)).toEqual(['Client One']);
    expect(comp.patientForm.get('patient.dischargeInfo.patientDischargedTo')!.value).toBe('2PEXyKgz');
  });

  it('groups available operations by client group for the facility selector', () => {
    const groupedUser = {
      operations: [
        { operationId: 'op-1', operationName: 'Facility One', operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationId: 'op-2', operationName: 'Facility Two', operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationId: 'op-3', operationName: 'Facility Three', operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ],
      operationGroups: [
        { operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ]
    } as any;
    const route = { snapshot: { data: { mode: 'add', user: groupedUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService,
      services.modalController
    );

    comp.ngOnInit();

    expect(comp.groupedOperations.map(group => group.label)).toEqual(['Client One', 'Client Two']);
    expect(comp.groupedOperations[0].operations.map(operation => operation.operationName)).toEqual([
      'Facility One',
      'Facility Two'
    ]);
    expect(comp.groupedOperations[1].operations.map(operation => operation.operationName)).toEqual(['Facility Three']);
  });

  it('falls back to grouping by operation group name when user operation groups are unavailable', () => {
    const groupedUser = {
      operations: [
        { operationId: 'op-1', operationName: 'Facility One', operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationId: 'op-2', operationName: 'Facility Two', operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ]
    } as any;
    const route = { snapshot: { data: { mode: 'add', user: groupedUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService,
      services.modalController
    );

    comp.ngOnInit();

    expect(comp.groupedOperations.map(group => group.label)).toEqual(['Client One', 'Client Two']);
  });

  it('opens the searchable facility modal with the current selection and uppercase option labels', async () => {
    const groupedUser = {
      operations: [
        { operationId: 'op-1', operationName: 'Facility One', operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationId: 'op-2', operationName: 'Facility Two', operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ],
      operationGroups: [
        { operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ]
    } as any;
    const route = { snapshot: { data: { mode: 'add', user: groupedUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService,
      services.modalController
    );

    comp.ngOnInit();
    comp.patientForm.get('patient.operation')!.setValue('op-2');

    await comp.openFacilitySelectModal();

    expect(services.modalController.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cssClass: 'searchable-select-modal',
        componentProps: expect.objectContaining({
          title: 'Select Facility',
          selectedValue: 'op-2',
          placeholder: 'Search facilities'
        })
      })
    );

    const modalConfig = services.modalController.create.mock.calls[0][0];
    expect(modalConfig.componentProps.groups.map((group: any) => group.label)).toEqual(['Client One', 'Client Two']);
    expect(modalConfig.componentProps.groups[0].items.map((item: any) => item.label)).toEqual(['Facility One']);
    expect(modalConfig.componentProps.groups[1].items.map((item: any) => item.label)).toEqual(['Facility Two']);
  });

  it('applies the selected facility only after the modal confirms', async () => {
    const groupedUser = {
      operations: [
        { operationId: 'op-1', operationName: 'Facility One', operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationId: 'op-2', operationName: 'South Facility', operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ],
      operationGroups: [
        { operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ]
    } as any;
    const route = { snapshot: { data: { mode: 'add', user: groupedUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService,
      services.modalController
    );

    comp.ngOnInit();
    comp.patientForm.get('patient.operation')!.setValue('op-1');
    facilityModalDismissResult = { role: 'confirm', data: { value: 'op-2' } };

    await comp.openFacilitySelectModal();

    expect(comp.patientForm.get('patient.operation')!.value).toBe('op-2');
    expect(comp.selectedOperationName).toBe('South Facility');
  });

  it('keeps the existing facility when the modal is cancelled', async () => {
    const groupedUser = {
      operations: [
        { operationId: 'op-1', operationName: 'Facility One', operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationId: 'op-2', operationName: 'Facility Two', operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ],
      operationGroups: [
        { operationGroupId: 'og-1', operationGroupName: 'Client One' },
        { operationGroupId: 'og-2', operationGroupName: 'Client Two' }
      ]
    } as any;
    const route = { snapshot: { data: { mode: 'add', user: groupedUser } } } as any;
    const services = makeServices();
    const comp = new PatientFormComponent(
      new FormBuilder(),
      route,
      services.patientService,
      services.patientContactService,
      services.patientIntakeQuestionService,
      services.toastrService,
      services.userService,
      services.modalController
    );

    comp.ngOnInit();
    comp.patientForm.get('patient.operation')!.setValue('op-1');
    facilityModalDismissResult = { role: 'cancel' };

    await comp.openFacilitySelectModal();

    expect(comp.patientForm.get('patient.operation')!.value).toBe('op-1');
    expect(comp.selectedOperationName).toBe('Facility One');
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
      services.userService,
      services.modalController
    );

    comp.ngOnInit();
    await Promise.resolve();

    expect(comp.mode.edit).toBe(true);
    expect(services.patientService.getPatientByPatientId).toHaveBeenCalledWith('p-edit');
    expect(comp.patientForm).toBeTruthy();
    expect(comp.patientForm.get('patient.dischargeInfo.patientDischargedTo')!.value).toBe('lbl-1');
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
      services.userService,
      services.modalController
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
    comp.patientForm.get('patient.dischargeInfo.patientAdmitDate')!.setValue('2020-01-01');
    comp.patientForm.get('patient.dischargeInfo.patientDischargeDate')!.setValue('2020-01-02');

    comp.updateDischargeFields();

    expect(comp.patientMaxAdmitDate).toBe('2020-01-02');
    expect(comp.patientMinDischargeDate).toBe('2020-01-01');
    expect(comp.patientForm.get('patient.dischargeInfo.patientTotalDays')!.value).toBe(1);
  });

  it('opens the discharge date picker with the current control value and current admit/discharge bounds', () => {
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
    comp.openDischargeDatePicker('patientAdmitDate');

    expect(comp.activeDischargeDateControl).toBe('patientAdmitDate');
    expect(comp.activeDischargeDateValue).toBe('2020-01-01');
    expect(comp.getActiveDischargeDateMax()).toBe('2020-01-02');
    expect(comp.getActiveDischargeDateMin()).toBeUndefined();

    comp.openDischargeDatePicker('patientDischargeDate');

    expect(comp.activeDischargeDateControl).toBe('patientDischargeDate');
    expect(comp.activeDischargeDateValue).toBe('2020-01-02');
    expect(comp.getActiveDischargeDateMin()).toBe('2020-01-01');
    expect(comp.getActiveDischargeDateMax()).toBeUndefined();

    comp.openDischargeDatePicker('patientDischargeDate');

    expect(comp.activeDischargeDateControl).toBeNull();
    expect(comp.activeDischargeDateValue).toBeNull();
  });

  it('applies a confirmed discharge date picker selection back into the form', () => {
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
    comp.openDischargeDatePicker('patientDischargeDate');
    comp.onDischargeDatePickerChange({ detail: { value: '2020-01-05T00:00:00' } } as any);

    expect(comp.patientForm.get('patient.dischargeInfo.patientDischargeDate')!.value).toBe('2020-01-05');
    expect(comp.patientMaxAdmitDate).toBe('2020-01-05');
    expect(comp.patientForm.get('patient.dischargeInfo.patientTotalDays')!.value).toBe(4);
    expect(comp.activeDischargeDateControl).toBeNull();
    expect(comp.activeDischargeDateValue).toBeNull();
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
  expect(comp.patientForm.get('patient.patientSpeaksEnglish')!.value).toBe(true);
  expect(comp.patientForm.get('patient.patientFluentLanguage')!.value).toBe('Spanish');

    comp.clearPatientFluentLanguage();

  expect(comp.patientForm.get('patient.patientSpeaksEnglish')!.value).toBe(false);
  expect(comp.patientForm.get('patient.patientFluentLanguage')!.value).toBe('');
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

  it('reindexes remaining contact orders after a removal', () => {
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
    comp.addAdditionalPatientContact();
    comp.patientContacts[0].patientContactId = 'pc-1';
    comp.patientContacts[1].patientContactId = 'pc-2';

    comp.removeAdditionalPatientContact(0);

    expect(comp.patientContactsToRemove).toEqual(['pc-1']);
    expect(comp.patientContacts.length).toBe(1);
    expect(comp.patientContacts[0].patientContactOrder).toBe('1');
    expect((comp.patientForm.get('patient.patientContacts') as FormArray).at(0).get('patientContactOrder')!.value).toBe(1);
  });

  it('does not queue an undefined removal id for unsaved contacts', () => {
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

    comp.removeAdditionalPatientContact(0);

    expect(comp.patientContactsToRemove).toEqual([]);
    expect((comp.patientForm.get('patient.patientContacts') as FormArray).length).toBe(0);
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
      patientContactHIPAABoolean: 0,
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
      patientContactHIPAABoolean: 0,
      patientContactResponsiblePartyBoolean: 0
    });
  });

  it('keeps contact HIPAA flag aligned to responsible-party toggle', () => {
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

    const patientContactControl = (comp.patientForm.get('patient.patientContacts') as FormArray).at(0);
    patientContactControl.get('patientContactResponsiblePartyBoolean')!.setValue(true);

    comp.syncContactFlags(0);

    expect(patientContactControl.get('patientContactHIPAABoolean')!.value).toBe(true);
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
        patientIsResponsibleParty: true,
        patientSpeaksEnglish: false,
        patientFluentLanguage: 'Spanish',
        hospitalAdmitted: {
          patientHospitalAdmitted: 'General Hospital'
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
      patientPhoneNumber: '555-1234',
      patientGender: 'M',
      patientHIPAA: 1,
      patientIsResponsibleParty: 1,
      patientSpeaksEnglish: 1,
      patientFluentLanguage: '',
      patientHospitalAdmitted: 'General Hospital',
      patientPrimaryInsurance: 'General Hospital',
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
        patientPhoneNumber: '555-1234',
        patientGender: 'M',
        patientIsResponsibleParty: true,
        patientSpeaksEnglish: true,
        patientFluentLanguage: 'Spanish',
        hospitalAdmitted: {
          patientHospitalAdmitted: 'General Hospital'
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
        patientFluentLanguage: 'Spanish',
        patientHospitalAdmitted: 'General Hospital',
        patientPrimaryInsurance: 'General Hospital'
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
    const navigateSpy = jest.spyOn(comp as any, 'navigateTo').mockImplementation(() => undefined);

    const formSubmission: any = {
      patient: {
        patientDob: '2021-01-01',
        operation: 'op-1',
        patientMedicalRecordNumber: 'mrn',
        patientName: { patientFirstName: 'John', patientLastName: 'Doe' },
        patientCountryCode: '1',
        patientAreaCode: '212',
        patientPhoneNumber: '555-1234',
        patientGender: 'M',
        patientIsResponsibleParty: true,
        patientSpeaksEnglish: true,
        patientFluentLanguage: 'Spanish',
        hospitalAdmitted: {
          patientHospitalAdmitted: 'General Hospital'
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
    expect(navigateSpy).toHaveBeenCalledWith('/operations/op-1/patients');
    navigateSpy.mockRestore();
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
    const navigateSpy = jest.spyOn(comp as any, 'navigateTo').mockImplementation(() => undefined);

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
        patientIsResponsibleParty: true,
        patientSpeaksEnglish: false,
        patientFluentLanguage: 'Spanish',
        hospitalAdmitted: {
          patientHospitalAdmitted: 'General Hospital'
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
        patientFluentLanguage: '',
        patientHospitalAdmitted: 'General Hospital',
        patientPrimaryInsurance: 'General Hospital'
      })
    );
    expect(services.userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect(navigateSpy).toHaveBeenCalledWith('/operations/op-1/patients');
    navigateSpy.mockRestore();
  });

  it('normalizes short discharge year values before building payload', () => {
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
        patientIsResponsibleParty: true,
        patientSpeaksEnglish: false,
        patientFluentLanguage: '',
        hospitalAdmitted: {
          patientHospitalAdmitted: 'General Hospital'
        },
        dischargeInfo: {
          patientAdmitDate: '0026-01-02',
          patientDischargeDate: '0026-01-03',
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

    expect(payload.patientAdmitDate).toBe('2026-01-02T12:00:00.00Z');
    expect(payload.patientDischargeDate).toBe('2026-01-03T12:00:00.00Z');
  });

  it('normalizes legacy patient HIPAA state into the responsible-party checkbox', () => {
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
      patientHIPAA: true,
      patientIsResponsibleParty: false,
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

    expect(comp.patientForm.get('patient.patientIsResponsibleParty')!.value).toBe(true);
  });

  it('derives patient HIPAA from responsible-party state in the submit payload', () => {
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

    const payload = (comp as any).formSubmissionFactory({
      patient: {
        patientDob: '2021-01-01',
        operation: 'op-1',
        patientMedicalRecordNumber: 'mrn',
        patientName: { patientFirstName: 'John', patientLastName: 'Doe' },
        patientCountryCode: '1',
        patientAreaCode: '212',
        patientPhoneNumber: '5551234',
        patientGender: 'M',
        patientIsResponsibleParty: false,
        patientSpeaksEnglish: false,
        patientFluentLanguage: '',
        hospitalAdmitted: {
          patientHospitalAdmitted: 'General Hospital'
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
    });

    expect(payload.patientHIPAA).toBe(0);
    expect(payload.patientIsResponsibleParty).toBe(0);
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
    const reloadMock = jest.spyOn(comp as any, 'reloadPage').mockImplementation(() => undefined);

    comp.cancel();

    expect(reloadMock).toHaveBeenCalled();
    reloadMock.mockRestore();
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
    const navigateSpy = jest.spyOn(comp as any, 'navigateTo').mockImplementation(() => undefined);

    comp.deletePatient(1);
    await Promise.resolve();

    expect(services.patientService.deletePatientByPatientId).toHaveBeenCalledWith('p-1');
    expect(services.userService.updateOperations).toHaveBeenCalledWith(comp.user);
    expect(navigateSpy).toHaveBeenCalledWith('/operations/op-1/patients');

    confirmSpy.mockRestore();
    navigateSpy.mockRestore();
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
