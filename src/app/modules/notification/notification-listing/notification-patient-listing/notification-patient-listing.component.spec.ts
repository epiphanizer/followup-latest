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
        notificationStatusLabel: 'New',
        notificationCareRepName: 'Care Rep',
        notificationId: 'n1'
      }
    ])
  )
};

describe('NotificationPatientListingComponent (Jest)', () => {
  let component: NotificationPatientListingComponent;
  let fixture: ComponentFixture<NotificationPatientListingComponent>;

  beforeEach(async () => {
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
  });
});
