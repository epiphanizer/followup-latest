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
    getAllOperationGroups: jest.fn(() => of([])),
    getOperationGroups: jest.fn(() => of([])),
    addNewOperationGroup: jest.fn(() => of([{ operationGroupId: 'og1', operationGroupName: 'Ops' }])),
    editOperationGroupByOperationGroupId: jest.fn(() =>
      of([{ operationGroupId: 'og1', operationGroupName: 'PACS', operationGroupShortName: 'WZ PACS' }])
    )
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
  const userServiceMock: any = {
    updateOperations: jest.fn(() => Promise.resolve()),
    getActiveUsers: jest.fn(() => of([]))
  };
  const cdrMock: any = { detectChanges: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
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

    component.user = { userId: 'u1', userLevel: '2PEXyKgz', operationGroups: [] } as any;
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
    (component as any).createForm();
  });

  describe('Operation Payload Factory', () => {
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
      expect(payload.operationCity).toBe('');
    });

    it('converts active flag from string to integer', () => {
      const payload = component.operationPutFactory({
        operation: {
          operationName: 'Name',
          operationGroupId: 'g1',
          operationActive: '1',
          operationAddress: '',
          operationCity: '',
          operationState: '',
          operationZip: '',
          operationCountryCode: '',
          operationAreaCode: '',
          operationPhoneNumber: ''
        }
      });

      expect(typeof payload.operationActive).toBe('number');
      expect(payload.operationActive).toBe(1);
    });

    it('defaults operationActive to 1 if not provided', () => {
      const payload = component.operationPutFactory({
        operation: {
          operationName: 'Name',
          operationGroupId: 'g1',
          operationAddress: '',
          operationCity: '',
          operationState: '',
          operationZip: '',
          operationCountryCode: '',
          operationAreaCode: '',
          operationPhoneNumber: ''
        }
      });

      expect(payload.operationActive).toBe(1);
    });

    it('handles empty string phone numbers', () => {
      const payload = component.operationPutFactory({
        operation: {
          operationName: 'Name',
          operationGroupId: 'g1',
          operationPhoneNumber: '',
          operationAddress: '',
          operationCity: '',
          operationState: '',
          operationZip: '',
          operationCountryCode: '',
          operationAreaCode: '',
          operationActive: '1'
        }
      });

      expect(payload.operationPhoneNumber).toBe('');
    });
  });

  describe('Operation Contact Factories', () => {
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

    it('defaults operationContactActive to 1 in both POST and PUT', () => {
      const postPayload = component.operationContactPostFactory({
        operationContactFirstName: 'A',
        operationContactLastName: 'B',
        operationContactTitle: '',
        operationContactCountryCode: 1,
        operationContactAreaCode: '',
        operationContactPhoneNumber: '',
        operationContactEmail: 'a@b.com',
        operationContactOrder: 1
      });

      const putPayload = component.operationContactPutFactory({
        operationContactOrder: 1,
        operationContactFirstName: 'A',
        operationContactLastName: 'B',
        operationContactTitle: '',
        operationContactCountryCode: '',
        operationContactAreaCode: '',
        operationContactPhoneNumber: '',
        operationContactEmail: 'a@b.com'
      });

      expect(postPayload.operationContactActive).toBe(1);
      expect(putPayload.operationContactActive).toBe(1);
    });

    it('handles null and undefined values in phone fields', () => {
      const putPayload = component.operationContactPutFactory({
        operationContactOrder: 1,
        operationContactFirstName: 'A',
        operationContactLastName: 'B',
        operationContactTitle: '',
        operationContactCountryCode: null,
        operationContactAreaCode: undefined,
        operationContactPhoneNumber: undefined,
        operationContactEmail: 'a@b.com'
      });

      expect(putPayload.operationContactCountryCode).toBe('1');
      expect(putPayload.operationContactAreaCode).toBe('');
      expect(putPayload.operationContactPhoneNumber).toBe('');
    });
  });

  describe('Form Validation', () => {
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

    it('returns false for empty field with required validator', () => {
      component.operationForm = fb.group({
        operationName: new FormControl('', Validators.required)
      });
      document.body.innerHTML = '<div class="ng-invalid"></div>';

      expect(component.validateControls()).toBe(false);
    });
  });

  describe('Operation Group Modal Management', () => {
    it('manages add operation group modal state', () => {
      component.addOperationGroupForm();
      expect(component.addOperationGroupModalOn).toBe(true);
      expect(component.addOperationGroupFormControl.contains('operationGroupName')).toBe(true);

      component.closeOperationGroupForm();
      expect(component.addOperationGroupModalOn).toBe(false);
    });

    it('creates form with empty fields for new group', () => {
      component.addOperationGroupForm();

      expect(component.addOperationGroupFormControl.get('operationGroupName').value).toBe('');
      expect(component.addOperationGroupFormControl.get('operationGroupShortName').value).toBe('');
    });
  });

  describe('Operation Group CRUD Operations', () => {
    it('adds new operation group and updates local caches', () => {
      component.operationGroups = [];
      component.addOperationGroupForm();
      component.addOperationGroupFormControl.patchValue({
        operationGroupName: 'PACS',
        operationGroupShortName: 'WZ PACS'
      });

      component.addOperationGroup();

      expect(operationServiceMock.addNewOperationGroup).toHaveBeenCalledWith('PACS', 'WZ PACS');
      expect(toastrMock.success).toHaveBeenCalledWith('Successfully added operation group');
      expect(component.operationGroups.length).toBe(1);
      expect(component.addOperationGroupModalOn).toBe(false);
    });
  });

  describe('Ownership Group Select', () => {
    beforeEach(() => {
      component.operationGroups = [
        { operationGroupId: 'og1', operationGroupName: 'West Coast PACS', operationGroupShortName: 'WCP' } as any,
        {
          operationGroupId: 'og2',
          operationGroupName: 'Mountain View Rehab',
          operationGroupShortName: 'MVR'
        } as any,
        { operationGroupId: 'og3', operationGroupName: 'Eastside Hospice', operationGroupShortName: 'EH' } as any
      ];
      component.operation = {
        ...(component.operation as any),
        operationGroupId: 'og1'
      } as any;
    });

    it('selects an ownership group from the ionic select and updates form control', () => {
      component.operationGroupOnSelect({ detail: { value: 'og3' } });

      expect(component.operationForm.get('operation.operationGroupId').value).toBe('og3');
      expect(component.operation.operationGroupId).toBe('og3');
    });

    it('hydrates ownership groups from the API for add mode when the user snapshot is empty', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = { userId: 'u1', userLevel: '2PEXyKgz', operationGroups: [] };
      operationServiceMock.getAllOperationGroups.mockReturnValueOnce(
        of([
          { operationGroupId: 'og10', operationGroupName: 'Alpha Group', operationGroupShortName: 'AG' },
          { operationGroupId: 'og11', operationGroupName: 'Beta Group', operationGroupShortName: 'BG' }
        ] as any)
      );

      const addModeComponent = new OperationFormComponent(
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

      addModeComponent.ngOnInit();

      expect(operationServiceMock.getAllOperationGroups).toHaveBeenCalled();
      expect(addModeComponent.operationGroups.length).toBe(2);
      expect(addModeComponent.operationGroups[1].operationGroupId).toBe('og11');

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('falls back to the narrower ownership group feed when the all-groups request is empty', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = { userId: 'u1', userLevel: '2PEXyKgz', operationGroups: [] };
      operationServiceMock.getAllOperationGroups.mockReturnValueOnce(of([]));
      operationServiceMock.getOperationGroups.mockReturnValueOnce(
        of([{ operationGroupId: 'og20', operationGroupName: 'Fallback Group', operationGroupShortName: 'FG' }] as any)
      );

      const addModeComponent = new OperationFormComponent(
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

      addModeComponent.ngOnInit();

      expect(operationServiceMock.getAllOperationGroups).toHaveBeenCalled();
      expect(operationServiceMock.getOperationGroups).toHaveBeenCalled();
      expect(addModeComponent.operationGroups.length).toBe(1);
      expect(addModeComponent.operationGroups[0].operationGroupId).toBe('og20');

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('uses cached ownership groups immediately while api hydration is still pending', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = { userId: 'u1', userLevel: '2PEXyKgz', operationGroups: [] };
      localStorage.setItem(
        'operationGroups',
        JSON.stringify([
          { operationGroupId: 'og30', operationGroupName: 'Cached Group', operationGroupShortName: 'CG' }
        ])
      );
      operationServiceMock.getAllOperationGroups.mockReturnValueOnce(of([]));
      operationServiceMock.getOperationGroups.mockReturnValueOnce(of([]));

      const addModeComponent = new OperationFormComponent(
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

      addModeComponent.ngOnInit();

      expect(addModeComponent.operationGroups.length).toBe(1);
      expect(addModeComponent.operationGroups[0].operationGroupId).toBe('og30');

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('preserves the existing ownership group when a refresh payload omits operationGroupId', () => {
      component.operationGroups = [
        { operationGroupId: 'og1', operationGroupName: 'West Coast PACS', operationGroupShortName: 'WCP' } as any
      ];

      component.updateOperation({
        operationId: 'op1',
        operationName: 'Updated Op',
        operationAddress: '',
        operationCity: '',
        operationState: '',
        operationZip: '',
        operationCountryCode: '1',
        operationAreaCode: '',
        operationPhoneNumber: '',
        operationActive: true
      } as any);

      expect(component.operation.operationGroupId).toBe('og1');
      expect(component.operationForm.get('operation.operationGroupId')?.value).toBe('og1');
    });
  });

  describe('Operation Contact Management', () => {
    it('adds additional operation contacts with default notifications', () => {
      component.addAdditionalOperationContact();

      expect(component.operationContacts.length).toBe(1);
      const formArray = component.operationForm.controls.operationContacts as any;
      expect(formArray.length).toBe(1);
      expect(formArray.at(0).get('operationContactOrder').value).toBe(1);
    });

    it('maintains order when adding multiple contacts', () => {
      component.addAdditionalOperationContact();
      component.addAdditionalOperationContact();
      component.addAdditionalOperationContact();

      const formArray = component.operationForm.controls.operationContacts as any;
      expect(formArray.at(0).get('operationContactOrder').value).toBe(1);
      expect(formArray.at(1).get('operationContactOrder').value).toBe(2);
      expect(formArray.at(2).get('operationContactOrder').value).toBe(3);
    });

    it('removes an operation contact and tracks deletion', () => {
      component.addAdditionalOperationContact();
      component.operationContacts[0].operationContactId = 'c1';

      component.removeOperationContact(0);

      expect(component.operationContactsToRemove).toContain('c1');
      expect((component.operationForm.controls.operationContacts as any).length).toBe(0);
    });

    it('reorders contacts after removal', () => {
      component.addAdditionalOperationContact();
      component.addAdditionalOperationContact();
      component.addAdditionalOperationContact();
      component.operationContacts[1].operationContactId = 'c2';

      component.removeOperationContact(1);

      expect(component.operationContacts[0].operationContactOrder).toBe(1);
      expect(component.operationContacts[1].operationContactOrder).toBe(2);
    });

    it('handles removal of non-existing contact gracefully', () => {
      component.addAdditionalOperationContact();
      component.operationContacts[0].operationContactId = 'c1';

      expect(() => {
        component.removeOperationContact(0);
      }).not.toThrow();

      expect(component.operationContactsToRemove).toContain('c1');
    });
  });

  describe('Operation Selection', () => {
    it('changes operation and resets contact data', () => {
      component.operationContactsOriginal = ['old'];
      const spy = jest.spyOn(component as any, 'cleanData');

      component.operationChangeEventHandler('new-op-id');

      expect(spy).toHaveBeenCalled();
      expect(operationServiceMock.getOperationByOperationId).toHaveBeenCalledWith('new-op-id');
    });
  });

  describe('Form Lifecycle', () => {
    it('cleans up on destroy', () => {
      component.operationContacts = [{ operationContactId: 'c1' }] as any;
      component.operationContactsOriginal = ['c1'];

      component.ngOnDestroy();

      expect(component.operationContacts).toBeNull();
      expect(component.operationContactsOriginal).toBeNull();
    });
  });
});
