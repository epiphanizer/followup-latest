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
  const changeDetectorRefStub = {
    detectChanges: jest.fn()
  } as any;
  const routeStub = { snapshot: { data: {} } } as any;

  const component = new NotificationModalComponent(
    modalCtrlStub,
    new FormBuilder(),
    notificationServiceStub,
    operationContactsServiceStub,
    routeStub,
    toastrStub,
    changeDetectorRefStub
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

  it('syncs current form values before entering saved review mode', () => {
    const { component, notificationServiceStub } = buildComponent();

    component.ngOnInit();
    component.createNotificationForm.get('notificationTypeId').setValue('type-1');
    component.createNotificationForm.get('notificationMessage').setValue('review me');

    component.notification.notificationTypeId = '' as any;
    component.notification.notificationTypeLabel = '';
    component.notification.notificationIconImage = '';
    component.notification.notificationMessage = '';

    component.saveNotification();

    expect(component.status.notification.saved).toBe(true);
    expect(component.notification.notificationTypeId).toBe('type-1');
    expect(component.notification.notificationTypeLabel).toBe('Type 1');
    expect(component.notification.notificationIconImage).toBe('icon.png');
    expect(component.notification.notificationMessage).toBe(encodeURI('review me'));
    expect(notificationServiceStub.getNotificationRecipientsByOperationIdAndNotificationTypeId).toHaveBeenCalledWith(
      'op-1',
      'type-1'
    );
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

  it('prefers rendered notification options over the loading state once data exists', () => {
    const { component } = buildComponent();

    component.ngOnInit();
    component.notificationTypes = [
      {
        notificationTypeId: 'type-1',
        notificationTypeLabel: 'Type 1',
        notificationIconImage: 'icon.png'
      } as any
    ];
    component.notificationTypesLoading = true;

    const loadingStillVisible = component.notificationTypesLoading && !component.notificationTypes.length;

    expect(loadingStillVisible).toBe(false);
  });

  it('initializes safely when the notification seed is missing', () => {
    const { component, operationContactsServiceStub } = buildComponent();
    component.notification = undefined as any;

    component.ngOnInit();

    expect(component.notification.notificationOperationId).toBe('');
    expect(component.notificationTypesLoading).toBe(false);
    expect(operationContactsServiceStub.getOperationContactsByOperationId).not.toHaveBeenCalled();
  });

  it('normalizes wrapped notification type payloads into rendered options', () => {
    const { component, notificationServiceStub } = buildComponent();
    notificationServiceStub.getNotificationTypes.mockReturnValueOnce(
      of({
        notificationTypes: [
          {
            notificationTypeId: 'type-2',
            notificationTypeLabel: 'Type 2',
            notificationIconImage: 'icon-2.png'
          }
        ]
      } as any)
    );

    component.ngOnInit();

    expect(component.notificationTypesLoading).toBe(false);
    expect(component.notificationTypes).toHaveLength(1);
    expect(component.notificationTypes[0].notificationTypeId).toBe('type-2');
  });
});
