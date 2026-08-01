import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { NotificationPatientListingComponent } from './notification-patient-listing.component';
import { NotificationService } from '../../notification.service';

const notificationServiceStub = {
  getNotificationsByOperationId: jest.fn(() =>
    of([
      {
        notificationCreatedTime: '2020-01-01T00:00:00Z',
        notificationPatientFirstName: 'Pat',
        notificationPatientLastName: 'Smith',
        notificationTypeLabel: 'Test',
        notificationStatusLabelId: 'status-new',
        notificationStatusLabel: 'New',
        notificationCareRepName: 'Care Rep',
        notificationId: 'n1'
      }
    ])
  ),
  getNotificationRepliesByNotificationId: jest.fn(() => of([])),
  updateNotificationStatus: jest.fn((notificationId: string, statusLabelId: string) =>
    of({
      notificationId,
      notificationStatusLabelId: statusLabelId,
      notificationStatusLabel: statusLabelId === 'status-resolved' ? 'Resolved' : 'New'
    })
  )
};

describe('NotificationPatientListingComponent (Jest)', () => {
  let component: NotificationPatientListingComponent;
  let fixture: ComponentFixture<NotificationPatientListingComponent>;

  beforeEach(async () => {
    notificationServiceStub.getNotificationsByOperationId.mockClear();
    notificationServiceStub.getNotificationRepliesByNotificationId.mockClear();
    notificationServiceStub.getNotificationRepliesByNotificationId.mockImplementation(() => of([]));
    notificationServiceStub.updateNotificationStatus.mockClear();

    await TestBed.configureTestingModule({
      declarations: [NotificationPatientListingComponent],
      providers: [{ provide: NotificationService, useValue: notificationServiceStub }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPatientListingComponent);
    component = fixture.componentInstance;
    component.operation = { operationId: 'op1' } as any;
    fixture.detectChanges();
  });

  it('loads notifications for an operation', () => {
    expect(component).toBeTruthy();
    expect(component.notificationsFiltered?.length).toBe(1);
    expect(component.statusOptions).toEqual([{ id: 'status-new', label: 'New' }]);
    expect(notificationServiceStub.getNotificationRepliesByNotificationId).not.toHaveBeenCalled();
  });

  it('sorts notifications by date and toggles direction', () => {
    component.selectedSortOption = 'Date';
    component.selectedSortFlag = 'asc';
    component.runSortSwitch();
    expect(component.notificationsFiltered?.[0].notificationId).toBe('n1');

    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.notificationsFiltered?.[0].notificationId).toBe('n1');
  });

  it('filters notifications by patient name', () => {
    const filtered = component.searchNotifications('pat');
    expect(filtered.length).toBe(1);
    const none = component.searchNotifications('missing');
    expect(none.length).toBe(0);
    expect(component.emptyStateMessage).toBe('No notifications match the current search.');
  });

  it('sorts by patient name in both directions', () => {
    component.notifications = [
      {
        notificationCreatedTime: '2020-02-01T00:00:00Z',
        notificationPatientFirstName: 'Zoe',
        notificationPatientLastName: 'Beta',
        notificationTypeLabel: 'B',
        notificationStatusLabel: 'New',
        notificationCareRepName: 'Care Rep',
        notificationId: 'n2'
      } as any,
      ...component.notifications
    ];

    component.selectedSortOption = 'Patient';
    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.notificationsFiltered?.[0].notificationPatientLastName).toBe('Beta');

    component.selectedSortFlag = 'asc';
    component.runSortSwitch();
    expect(component.notificationsFiltered?.[0].notificationPatientLastName).toBe('Smith');
  });

  it('sorts by type and care rep', () => {
    component.notifications = [
      {
        notificationCreatedTime: '2020-02-01T00:00:00Z',
        notificationPatientFirstName: 'Zoe',
        notificationPatientLastName: 'Beta',
        notificationTypeLabel: 'Alpha',
        notificationStatusLabel: 'New',
        notificationCareRepName: 'B',
        notificationId: 'n2'
      } as any,
      {
        notificationCreatedTime: '2020-03-01T00:00:00Z',
        notificationPatientFirstName: 'Zoe',
        notificationPatientLastName: 'Beta',
        notificationTypeLabel: 'Zulu',
        notificationStatusLabel: 'New',
        notificationCareRepName: 'A',
        notificationId: 'n3'
      } as any
    ];

    component.selectedSortOption = 'Type';
    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.notificationsFiltered?.[0].notificationTypeLabel).toBe('Alpha');

    component.selectedSortOption = 'Care Rep';
    component.selectedSortFlag = 'asc';
    component.runSortSwitch();
    expect((component.notificationsFiltered?.[0] as any).notificationCareRepName).toBe('B');
  });

  it('returns false when runSortSwitch has no data and applies status sort', () => {
    component.notifications = undefined as any;
    expect(component.runSortSwitch()).toBe(false);

    component.notifications = [
      { notificationPatientLastName: 'Zed', notificationStatusLabel: 'Resolved' } as any,
      { notificationPatientLastName: 'Able', notificationStatusLabel: 'New' } as any
    ];
    component.selectedSortOption = 'Status';
    component.selectedSortFlag = 'desc';
    component.runSortSwitch();
    expect(component.notificationsFiltered?.[0].notificationStatusLabel).toBe('New');
  });

  it('updates notification status when a new option is selected', () => {
    component.statusOptions = [
      { id: 'status-new', label: 'New' },
      { id: 'status-resolved', label: 'Resolved' }
    ];

    const notification = {
      notificationId: 'n1',
      notificationStatusLabelId: 'status-new',
      notificationStatusLabel: 'New'
    } as any;

    component.notifications = [notification];
    component.onStatusSelectChange(notification, 'status-resolved');

    expect(notificationServiceStub.updateNotificationStatus).toHaveBeenCalledWith('n1', 'status-resolved');
    expect(component.notifications[0].notificationStatusLabelId).toBe('status-resolved');
  });

  it('does not call update when status selection is unchanged', () => {
    const notification = {
      notificationId: 'n1',
      notificationStatusLabelId: 'status-new',
      notificationStatusLabel: 'New'
    } as any;

    component.onStatusSelectChange(notification, 'status-new');

    expect(notificationServiceStub.updateNotificationStatus).not.toHaveBeenCalled();
  });

  it('shows resolved when an unresolved notification has attached replies even without replyCount', () => {
    const notification = {
      notificationId: 'n1',
      notificationStatusLabelId: 'status-unresolved',
      notificationStatusLabel: 'Unresolved',
      notificationReplies: [{ notificationReplyId: 'r1' }]
    } as any;

    expect(component.getReplyCount(notification)).toBe(1);
    expect(component.getDisplayStatus(notification)).toBe('Resolved');
  });

  it('treats string replyCount values as resolved status when the notification is unresolved', () => {
    const notification = {
      notificationId: 'n2',
      notificationStatusLabelId: 'status-unresolved',
      notificationStatusLabel: 'Unresolved',
      replyCount: '2'
    } as any;

    expect(component.getReplyCount(notification)).toBe(2);
    expect(component.getDisplayStatus(notification)).toBe('Resolved');
  });

  it('keeps an explicit non-unresolved status label even when replies exist', () => {
    const notification = {
      notificationId: 'n3',
      notificationStatusLabelId: 'status-resolved',
      notificationStatusLabel: 'Resolved',
      notificationReplies: [{ notificationReplyId: 'r1' }]
    } as any;

    expect(component.getDisplayStatus(notification)).toBe('Resolved');
  });

  it('shows explanatory text when an operation has no notifications', () => {
    component.notifications = [];
    component.notificationsFiltered = [];
    component.hasLoadedNotifications = true;
    component.currentSearchText = '';

    fixture.detectChanges();

    expect(component.emptyStateMessage).toBe('No notifications have been created for this operation yet.');
    expect(fixture.nativeElement.textContent).toContain('No notifications have been created for this operation yet.');
  });
});
