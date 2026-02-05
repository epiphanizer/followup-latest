import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SuperForm } from 'angular-super-validator';
import { OperationFormComponent } from './operation-form.component';
import { of } from 'rxjs';

describe('OperationFormComponent logic', () => {
  let component: OperationFormComponent;
  let fb: FormBuilder;
  const notificationServiceMock: any = { getNotificationTypes: jest.fn(() => of([])) };
  const notificationRecipientServiceMock: any = {
    addNotificationRecipientByOperationContactId: jest.fn(() => of({}))
  };
  const operationServiceMock: any = {
    addNewOperation: jest.fn(() => of({ operationId: 'op1' })),
    editOperationByOperationId: jest.fn(() => of({})),
    getOperationByOperationId: jest.fn(() => of({ operationId: 'op1' })),
    addNewOperationGroup: jest.fn(() => of([{ operationGroupId: 'og1', operationGroupName: 'Ops' }]))
  };
  const operationContactsServiceMock: any = {
    getOperationContactsByOperationId: jest.fn(() => of([])),
    addOperationContactByOperationId: jest.fn(() => of({ operationContactId: 'oc1' })),
    editOperationContactByOperationContactId: jest.fn(() => of({})),
    deactivateOperationContactByOperationContactId: jest.fn(() => of({}))
  };
  const routeStub: any = { snapshot: { data: { user: { operationGroups: [] }, mode: 'edit' } } };
  const routerStub: any = { navigate: jest.fn() };
  const toastrMock: any = { success: jest.fn(), error: jest.fn() };
  const userServiceMock: any = { updateOperations: jest.fn(() => Promise.resolve()) };
  const cdrMock: any = { detectChanges: jest.fn() };

  beforeEach(() => {
    fb = new FormBuilder();
    component = new OperationFormComponent(
      fb,
      notificationServiceMock,
      notificationRecipientServiceMock,
      operationServiceMock,
      operationContactsServiceMock,
      routeStub,
      routerStub,
      toastrMock,
      userServiceMock,
      cdrMock
    );

    component.user = { userId: 'u1', operationGroups: [] } as any;
    component.operation = {
      operationId: 'op1',
      operationGroupId: 'og1',
      operationName: 'Op',
      operationAddress: '',
      operationCity: '',
      operationState: '',
      operationZip: '',
      operationCountryCode: '',
      operationAreaCode: '',
      operationPhoneNumber: '',
      operationActive: true
    } as any;
    component.notificationTypes = [{ notificationTypeId: 'n1' } as any];
    component.createForm();
  });

  it('builds a sanitized operation payload', () => {
    const payload = component.operationPutFactory({
      operation: {
        operationName: 'Name',
        operationGroupId: 'g1',
        operationAddress: null,
        operationCity: null,
        operationState: null,
        operationZip: null,
        operationCountryCode: '1',
        operationAreaCode: '2',
        operationPhoneNumber: '999',
        operationActive: '0'
      }
    });

    expect(payload.operationActive).toBe(0);
    expect(payload.operationCountryCode).toBe('1');
    expect(payload.operationAddress).toBe('');
  });

  it('creates post and put payloads for contacts', () => {
    const postPayload = component.operationContactPostFactory({
      operationContactFirstName: 'A',
      operationContactLastName: 'B',
      operationContactTitle: 'Mgr',
      operationContactCountryCode: 1,
      operationContactAreaCode: '',
      operationContactPhoneNumber: '123',
      operationContactEmail: 'a@b.com',
      operationContactOrder: 3
    });
    const putPayload = component.operationContactPutFactory({
      operationContactOrder: 1,
      operationContactFirstName: 'C',
      operationContactLastName: 'D',
      operationContactTitle: '',
      operationContactCountryCode: '',
      operationContactAreaCode: null,
      operationContactPhoneNumber: undefined,
      operationContactEmail: 'c@d.com'
    });

    expect(postPayload.operationContactCountryCode).toBe('1');
    expect(postPayload.operationContactActive).toBe(1);
    expect(putPayload.operationContactAreaCode).toBe('');
    expect(putPayload.operationContactActive).toBe(1);
  });

  it('flags validation errors when invalid controls exist', () => {
    component.operationForm = fb.group({
      field: new FormControl('', Validators.required)
    });
    const errorsSpy = jest.spyOn(SuperForm, 'getAllErrors').mockReturnValue({ field: true });
    const errorsFlatSpy = jest.spyOn(SuperForm, 'getAllErrorsFlat').mockReturnValue({ field: true });
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    document.body.innerHTML = '<div class="ng-invalid"></div>';

    expect(component.validateControls()).toBe(false);
    expect(alertSpy).toHaveBeenCalled();

    alertSpy.mockRestore();
    errorsSpy.mockRestore();
    errorsFlatSpy.mockRestore();
  });

  it('passes validation when no invalid controls are present', () => {
    document.body.innerHTML = '';
    expect(component.validateControls()).toBe(true);
  });

  it('manages add operation group modal state', () => {
    component.addOperationGroupForm();
    expect(component.addOperationGroupModalOn).toBe(true);
    expect(component.addOperationGroupFormControl.contains('operationGroupName')).toBe(true);

    component.closeOperationGroupForm();
    expect(component.addOperationGroupModalOn).toBe(false);
  });

  it('adds additional operation contacts with default notifications', () => {
    component.addAdditionalOperationContact();

    expect(component.operationContacts.length).toBe(1);
    const formArray = component.operationForm.controls.operationContacts as any;
    expect(formArray.length).toBe(1);
    expect(formArray.at(0).get('operationContactOrder').value).toBe(1);
  });

  it('removes an operation contact and tracks deletion', () => {
    component.addAdditionalOperationContact();
    component.operationContacts[0].operationContactId = 'c1';

    component.removeOperationContact(0);

    expect(component.operationContactsToRemove).toContain('c1');
    expect((component.operationForm.controls.operationContacts as any).length).toBe(0);
  });
});
