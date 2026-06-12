import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { NotificationModalComponent } from './notification-modal.component';

const buildComponent = () => {
  const modalCtrlStub = { dismiss: jest.fn() } as any;
  const notificationServiceStub = {
    getNotificationTypes: jest.fn(() =>
      of([
        {
          notificationTypeId: 'type-1',
          notificationTypeLabel: 'Type 1',
          notificationIconImage: 'icon.png'
        } as any
      ])
    ),
    getNotificationRecipientsByOperationIdAndNotificationTypeId: jest.fn(() => of([{ id: 'r1' } as any])),
    addNotificationByOperationIdAndNotificationTypeId: jest.fn(() => of({ notificationId: 'notif-1' } as any)),
    sendNotificationByNotificationId: jest.fn(() => of(null))
  } as any;
  const operationContactsServiceStub = {
    getOperationContactsByOperationId: jest.fn(() => of([]))
  } as any;
  const toastrStub = {
    success: jest.fn(),
    error: jest.fn()
  } as any;
  const routeStub = { snapshot: { data: {} } } as any;

  const component = new NotificationModalComponent(
    modalCtrlStub,
    new FormBuilder(),
    notificationServiceStub,
    operationContactsServiceStub,
    routeStub,
    toastrStub
  );
  component.notification = {
    notificationOperationId: 'op-1',
    notificationTypeId: null,
    notificationTypeLabel: '',
    notificationIconImage: '',
    notificationMessage: ''
  } as any;

  return { component, modalCtrlStub, notificationServiceStub, operationContactsServiceStub, toastrStub };
};

describe('NotificationModalComponent (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes form, loads types, and wires contacts', () => {
    const { component, notificationServiceStub, operationContactsServiceStub } = buildComponent();

    component.ngOnInit();

    expect(notificationServiceStub.getNotificationTypes).toHaveBeenCalled();
    expect(operationContactsServiceStub.getOperationContactsByOperationId).toHaveBeenCalledWith('op-1');
    expect(component.createNotificationForm).toBeTruthy();
    expect(component.notificationTypesLoading).toBe(false);
    expect(component.notificationTypesError).toBeNull();
    expect(typeof component.todaysDate).toBe('string');
  });

  it('updates notification on form changes, saves, and sends', () => {
    const { component, notificationServiceStub, modalCtrlStub, toastrStub } = buildComponent();

    component.ngOnInit();
    component.createNotificationForm.get('notificationTypeId').setValue('type-1');
    component.createNotificationForm.get('notificationMessage').setValue('hello world');

    expect(component.notification.notificationTypeId).toBe('type-1');
    expect(component.notification.notificationMessage).toBe(encodeURI('hello world'));

    component.saveNotification();

    expect(notificationServiceStub.getNotificationRecipientsByOperationIdAndNotificationTypeId).toHaveBeenCalledWith(
      'op-1',
      'type-1'
    );
    expect(component.notificationRecipients?.length).toBe(1);
    expect(component.status.notification.saved).toBe(true);

    component.sendTheNotification();

    expect(notificationServiceStub.addNotificationByOperationIdAndNotificationTypeId).toHaveBeenCalledWith(
      component.notification
    );
    expect(notificationServiceStub.sendNotificationByNotificationId).toHaveBeenCalledWith('notif-1');
    expect(toastrStub.success).toHaveBeenCalled();
    expect(modalCtrlStub.dismiss).toHaveBeenCalled();
  });

  it('stops loading and records an error when notification types fail to load', () => {
    const { component, notificationServiceStub } = buildComponent();
    notificationServiceStub.getNotificationTypes.mockReturnValueOnce(throwError(() => new Error('boom')));

    component.ngOnInit();

    expect(component.createNotificationForm).toBeTruthy();
    expect(component.notificationTypesLoading).toBe(false);
    expect(component.notificationTypes).toEqual([]);
    expect(component.notificationTypesError).toBe('Unable to load notification options.');
  });
});
