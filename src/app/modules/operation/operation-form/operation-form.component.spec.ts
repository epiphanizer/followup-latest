import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { OperationFormComponent } from './operation-form.component';
import { of, Subject, throwError } from 'rxjs';
import { OperationGroup } from '../operation';

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
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      document.body.innerHTML =
        '<ion-item><ion-label>Facility Name *</ion-label><ion-input formControlName="field"></ion-input></ion-item>';
      const item = document.querySelector('ion-item') as HTMLElement;
      const input = document.querySelector('ion-input') as any;
      item.scrollIntoView = jest.fn();
      input.setFocus = jest.fn(() => Promise.resolve());

      expect(component.validateControls()).toBe(false);
      expect(item.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      expect(input.setFocus).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Unable to save. Please check Facility Name.');

      alertSpy.mockRestore();
    });

    it('passes validation when no invalid controls are present', () => {
      component.operationForm = fb.group({
        operationName: new FormControl('Facility', Validators.required)
      });
      document.body.innerHTML = '';
      expect(component.validateControls()).toBe(true);
    });

    it('returns false from reactive form validity before ng-invalid classes render', () => {
      component.operationForm = fb.group({
        operationName: new FormControl('', Validators.required)
      });
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      document.body.innerHTML = '';

      expect(component.validateControls()).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to save. Please check the highlighted required fields. Your entries have been preserved.'
      );
      alertSpy.mockRestore();
    });
  });

  describe('Save Safety', () => {
    it('saves the facility once when a new contact has no notification types selected', () => {
      component.addAdditionalOperationContact();
      const contactGroup = (component.operationForm.get('operationContacts') as any).at(0);
      contactGroup.patchValue({
        operationContactFirstName: 'No',
        operationContactLastName: 'Alerts',
        operationContactEmail: 'no-alerts@example.com'
      });
      contactGroup.get('operationContactNotifications').at(0).get('n1').setValue(false);

      component.onFormSubmit();

      expect(operationContactsServiceMock.addOperationContactByOperationId).toHaveBeenCalledTimes(1);
      expect(notificationRecipientServiceMock.addNotificationRecipientByOperationContactId).not.toHaveBeenCalled();
      expect(operationServiceMock.editOperationByOperationId).toHaveBeenCalledTimes(1);
      expect(component.isSaving).toBe(false);
    });

    it('keeps the facility form available for retry when a contact save fails', () => {
      operationContactsServiceMock.addOperationContactByOperationId.mockReturnValueOnce(
        throwError(() => new Error('contact failed'))
      );
      component.addAdditionalOperationContact();

      component.onFormSubmit();

      expect(operationServiceMock.editOperationByOperationId).not.toHaveBeenCalled();
      expect(toastrMock.error).toHaveBeenCalledWith(
        'Facility was not fully saved. Your entries are still here; please review them and try again.'
      );
      expect(component.isSaving).toBe(false);
    });

    it('ignores repeated save clicks while contact work is pending', () => {
      const pendingContact = new Subject<any>();
      operationContactsServiceMock.addOperationContactByOperationId.mockReturnValueOnce(pendingContact);
      component.addAdditionalOperationContact();

      component.onFormSubmit();
      component.onFormSubmit();

      expect(operationContactsServiceMock.addOperationContactByOperationId).toHaveBeenCalledTimes(1);
      expect(component.isSaving).toBe(true);
      pendingContact.error(new Error('contact failed'));
      expect(component.isSaving).toBe(false);
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
    it('adds new operation group without poisoning shared user operation-group caches', () => {
      component.user.operationGroups = [
        {
          operationGroupId: 'visible-og1',
          operationGroupName: 'Visible Client',
          operationGroupShortName: 'VC',
          operationGroupActive: 1
        } as any
      ];
      component.operationGroups = [
        {
          operationGroupId: 'archived-og1',
          operationGroupName: 'Archived Client',
          operationGroupShortName: 'AC',
          operationGroupActive: 0
        } as any
      ];
      localStorage.setItem('operationGroups', JSON.stringify(component.user.operationGroups));
      localStorage.setItem('followup-user', JSON.stringify(component.user));
      component.addOperationGroupForm();
      component.addOperationGroupFormControl.patchValue({
        operationGroupName: 'PACS',
        operationGroupShortName: 'WZ PACS'
      });

      component.addOperationGroup();

      expect(operationServiceMock.addNewOperationGroup).toHaveBeenCalledWith('PACS', 'WZ PACS');
      expect(toastrMock.success).toHaveBeenCalledWith('Successfully added operation group');
      expect(component.operationGroups.length).toBe(2);
      expect(component.user.operationGroups).toEqual([
        {
          operationGroupId: 'visible-og1',
          operationGroupName: 'Visible Client',
          operationGroupShortName: 'VC',
          operationGroupActive: 1
        }
      ]);
      expect(JSON.parse(localStorage.getItem('operationGroups'))).toEqual(component.user.operationGroups);
      expect(JSON.parse(localStorage.getItem('followup-user')).operationGroups).toEqual(component.user.operationGroups);
      expect(component.addOperationGroupModalOn).toBe(false);
    });
  });

  describe('Ownership Group Select', () => {
    beforeEach(() => {
      component.operationGroups = [
        {
          operationGroupId: 'og1',
          operationGroupName: 'West Coast PACS',
          operationGroupShortName: 'WCP',
          operationGroupActive: 1
        } as any,
        {
          operationGroupId: 'og2',
          operationGroupName: 'Mountain View Rehab',
          operationGroupShortName: 'MVR',
          operationGroupActive: 0
        } as any,
        {
          operationGroupId: 'og3',
          operationGroupName: 'Eastside Hospice',
          operationGroupShortName: 'EH',
          operationGroupActive: 1
        } as any
      ];
      component.operation = {
        ...(component.operation as any),
        operationGroupId: 'og1'
      } as any;
      component.mode = {
        add: true,
        edit: false,
        view: false
      } as any;
    });

    it('selects an ownership group from the ionic select and updates form control', () => {
      component.operationGroupOnSelect({ detail: { value: 'og3' } });

      expect(component.operationForm.get('operation.operationGroupId').value).toBe('og3');
      expect(component.operation.operationGroupId).toBe('og3');
    });

    it('only exposes active operation groups for add-mode ownership selection', () => {
      expect(component.selectableOperationGroups.map((operationGroup: any) => operationGroup.operationGroupId)).toEqual([
        'og1',
        'og3'
      ]);
    });

    it('hydrates add-mode ownership groups from the visible user snapshot instead of the global API feed', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = {
        userId: 'u1',
        userLevel: '2PEXyKgz',
        operationGroups: [
          {
            operationGroupId: 'og10',
            operationGroupName: 'Alpha Group',
            operationGroupShortName: 'AG',
            operationGroupActive: 1,
            operations: [{ operationId: 'op10', operationActive: 1 }]
          },
          {
            operationGroupId: 'og11',
            operationGroupName: 'Beta Group',
            operationGroupShortName: 'BG',
            operationGroupActive: 1,
            operations: [{ operationId: 'op11', operationActive: 1 }]
          }
        ]
      };

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

      expect(operationServiceMock.getAllOperationGroups).not.toHaveBeenCalled();
      expect(operationServiceMock.getOperationGroups).not.toHaveBeenCalled();
      expect(addModeComponent.operationGroups.length).toBe(2);
      expect(addModeComponent.operationGroups.map((operationGroup: any) => operationGroup.operationGroupId)).toEqual([
        'og10',
        'og11'
      ]);

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('does not widen add-mode ownership groups beyond the visible user snapshot', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = {
        userId: 'u1',
        userLevel: '2PEXyKgz',
        operationGroups: [
          {
            operationGroupId: 'og90',
            operationGroupName: 'Visible Group',
            operationGroupShortName: 'VG',
            operationGroupActive: 1,
            operations: [{ operationId: 'op90', operationActive: 1 }]
          }
        ]
      };

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

      expect(addModeComponent.operationGroups.map((operationGroup: any) => operationGroup.operationGroupId)).toEqual([
        'og90'
      ]);

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('clears add-mode ownership options when the visible user snapshot has no selectable clients', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = { userId: 'u1', userLevel: '2PEXyKgz', operationGroups: [] };
      localStorage.setItem(
        'operationGroups',
        JSON.stringify([{ operationGroupId: 'og20', operationGroupName: 'Fallback Group', operationGroupShortName: 'FG' }])
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

  expect(operationServiceMock.getAllOperationGroups).not.toHaveBeenCalled();
  expect(operationServiceMock.getOperationGroups).not.toHaveBeenCalled();
      expect(addModeComponent.operationGroups.length).toBe(0);

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('uses the all-groups ownership feed outside add mode so archived current owners can still display', () => {
      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { userId: 'u1', userLevel: '2PEXyKgz', operationGroups: [] };
      routeStub.snapshot.data.operation = {
        operationId: 'op40',
        operationGroupId: 'og40',
        operationName: 'Archived Facility',
        operationAddress: '',
        operationCity: '',
        operationState: '',
        operationZip: '',
        operationCountryCode: '1',
        operationAreaCode: '',
        operationPhoneNumber: '',
        operationActive: true
      };
      operationServiceMock.getAllOperationGroups.mockReturnValueOnce(
        of([{ operationGroupId: 'og40', operationGroupName: 'Archived Group', operationGroupShortName: 'AG', operationGroupActive: 0 }] as any)
      );

      const editModeComponent = new OperationFormComponent(
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

      editModeComponent.ngOnInit();

      expect(operationServiceMock.getAllOperationGroups).toHaveBeenCalled();
      expect(editModeComponent.operationGroups[0].operationGroupId).toBe('og40');

      routeStub.snapshot.data.operation = undefined;
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('does not use cached ownership groups in add mode when visible user context is available', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = {
        userId: 'u1',
        userLevel: '2PEXyKgz',
        operationGroups: [
          {
            operationGroupId: 'og31',
            operationGroupName: 'Visible Group',
            operationGroupShortName: 'VG',
            operationGroupActive: 1,
            operations: [{ operationId: 'op31', operationActive: 1 }]
          }
        ]
      };
      localStorage.setItem(
        'operationGroups',
        JSON.stringify([
          { operationGroupId: 'og30', operationGroupName: 'Cached Group', operationGroupShortName: 'CG' }
        ])
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

      expect(addModeComponent.operationGroups.map((operationGroup: any) => operationGroup.operationGroupId)).toEqual([
        'og31'
      ]);

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('filters archived and operation-less ownership groups out of the visible add-mode user context', () => {
      routeStub.snapshot.data.mode = 'add';
      routeStub.snapshot.data.user = {
        userId: 'u1',
        userLevel: '2PEXyKgz',
        operationGroups: [
          {
            operationGroupId: 'og50',
            operationGroupName: 'Visible Group',
            operationGroupShortName: 'VG',
            operationGroupActive: 1,
            operations: [{ operationId: 'op50', operationActive: 1 }]
          },
          {
            operationGroupId: 'og51',
            operationGroupName: 'Archived Group',
            operationGroupShortName: 'AG',
            operationGroupActive: 0,
            operations: [{ operationId: 'op51', operationActive: 1 }]
          },
          {
            operationGroupId: 'og52',
            operationGroupName: 'No Operations Group',
            operationGroupShortName: 'NOG',
            operationGroupActive: 1,
            operations: []
          }
        ]
      };

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

      expect(addModeComponent.operationGroups.map((operationGroup: any) => operationGroup.operationGroupId)).toEqual([
        'og50'
      ]);

      routeStub.snapshot.data.mode = 'edit';
      routeStub.snapshot.data.user = { operationGroups: [] };
    });

    it('preserves the currently selected archived ownership group outside add mode', () => {
      component.mode = {
        add: false,
        edit: true,
        view: false
      } as any;
      component.operation.operationGroupId = 'og2';
      component.operationForm.get('operation.operationGroupId').setValue('og2');

      expect(component.selectableOperationGroups.map((operationGroup: any) => operationGroup.operationGroupId)).toEqual([
        'og2',
        'og1',
        'og3'
      ]);
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

    it('redirects save success to the submitted ownership client even when the placeholder operation group id is empty', async () => {
      component.operation.operationGroupId = undefined as any;
      component['handleOperationSaveSuccess']('og3');
      await Promise.resolve();

      expect(toastrMock.success).toHaveBeenCalledWith('Successfully saved operation');
      expect(userServiceMock.updateOperations).toHaveBeenCalledWith(component.user);
      expect(routerStub.navigate).toHaveBeenCalledWith(['/clients', 'og3']);
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
