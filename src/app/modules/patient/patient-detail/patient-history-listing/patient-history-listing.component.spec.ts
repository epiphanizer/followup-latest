import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { PatientHistoryListingComponent } from './patient-history-listing.component';
import { PatientCallQuestionsService } from '@app/modules/patient/patient-detail/patient-call/patient-call-questions/patient-call-questions.service';
import { SharedFunctions } from '@app/shared/shared.functions';
import { NotificationService } from '@app/modules/notification/notification.service';
import { UserRoles } from '@app/modules/user/user';

describe('PatientHistoryListingComponent (Jest)', () => {
  let component: PatientHistoryListingComponent;
  let fixture: ComponentFixture<PatientHistoryListingComponent>;

  const patientCallQuestionsServiceStub = {
    getPatientCallQuestionsWithAnswersByPatientCallId: jest.fn(() => of([])),
    getPatientCallQuestionsWithAnswersByPatientId: jest.fn(() => of([]))
  };

  const sharedFunctionsStub = {
    returnHTML: jest.fn((val: string) => val)
  };

  const notificationServiceStub = {
    getNotificationRepliesByPatientId: jest.fn(() =>
      of([{ notificationReplyId: 'r1', notificationId: 'n1', patientId: 'p1', replyText: 'reply' }])
    )
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [PatientHistoryListingComponent],
      providers: [
        { provide: PatientCallQuestionsService, useValue: patientCallQuestionsServiceStub },
        { provide: SharedFunctions, useValue: sharedFunctionsStub },
        { provide: NotificationService, useValue: notificationServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(PatientHistoryListingComponent, {
        set: {
          providers: [
            { provide: PatientCallQuestionsService, useValue: patientCallQuestionsServiceStub },
            { provide: SharedFunctions, useValue: sharedFunctionsStub },
            { provide: NotificationService, useValue: notificationServiceStub }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PatientHistoryListingComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'p1', patientOperationId: 'op-1' } as any;
    component.user = {
      userId: 'u1',
      userLevel: UserRoles.manager,
      operations: [{ operationId: 'op-1', operationUserRoleLabelId: 2 }]
    } as any;
    component.patientCalls = [
      {
        patientCallId: 'c1',
        patientCallNotes: '<p>note</p>',
        patientCallStartTime: '2020-01-02T00:00:00Z',
        patientCallQuestions: []
      }
    ] as any;
    component.patientNotifications = [
      {
        notificationId: 'n1',
        notificationOperationId: 'op-1',
        notificationCreatedTime: '2020-01-03T00:00:00Z',
        notificationMessage: '<p>n</p>'
      }
    ] as any;
    fixture.detectChanges();
  });

  it('combines patient calls and notifications into activity', () => {
    expect(component).toBeTruthy();
    expect(component.patientActivity.length).toBe(2);
  });

  it('hydrates contacted history call questions with one patient-level request', () => {
    jest.clearAllMocks();
    patientCallQuestionsServiceStub.getPatientCallQuestionsWithAnswersByPatientId.mockReturnValueOnce(
      of([{ patientCallId: 'c-contacted', patientCallQuestionId: 'q1', patientCallQuestionAnswer: 'yes' }])
    );
    component.patientActivity = [];
    component.patientCalls = [
      {
        patientCallId: 'c-contacted',
        patientCallStatusLabel: 'Contacted',
        patientCallNotes: '<p>note</p>',
        patientCallStartTime: '2020-01-02T00:00:00Z',
        patientCallQuestions: []
      }
    ] as any;
    component.patientNotifications = [] as any;

    component.ngOnInit();

    expect(patientCallQuestionsServiceStub.getPatientCallQuestionsWithAnswersByPatientId).toHaveBeenCalledTimes(1);
    expect(patientCallQuestionsServiceStub.getPatientCallQuestionsWithAnswersByPatientId).toHaveBeenCalledWith('p1');
    expect(patientCallQuestionsServiceStub.getPatientCallQuestionsWithAnswersByPatientCallId).not.toHaveBeenCalled();
    expect(component.patientCalls[0].patientCallQuestions[0].patientCallQuestionAnswer).toBe('yes');
  });

  it('skips call-question hydration for non-contacted history calls', () => {
    jest.clearAllMocks();
    component.patientActivity = [];
    component.patientCalls = [
      {
        patientCallId: 'c-started',
        patientCallStatusLabel: 'Started',
        patientCallNotes: '<p>note</p>',
        patientCallStartTime: '2020-01-02T00:00:00Z',
        patientCallQuestions: []
      }
    ] as any;
    component.patientNotifications = [] as any;

    component.ngOnInit();

    expect(patientCallQuestionsServiceStub.getPatientCallQuestionsWithAnswersByPatientId).not.toHaveBeenCalled();
    expect(patientCallQuestionsServiceStub.getPatientCallQuestionsWithAnswersByPatientCallId).not.toHaveBeenCalled();
  });

  it('shows View / Reply for manager-or-above access on the patient operation', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.notification-detail-link')?.textContent).toContain('View / Reply');
  });

  it('hydrates notification replies with one patient-level request', () => {
    expect(notificationServiceStub.getNotificationRepliesByPatientId).toHaveBeenCalledTimes(1);
    expect(notificationServiceStub.getNotificationRepliesByPatientId).toHaveBeenCalledWith('p1');
    expect((component.patientNotifications[0] as any).notificationReplies).toHaveLength(1);
  });

  it('hides View / Reply for care rep access on the patient operation', () => {
    component.user = {
      userId: 'u2',
      userLevel: UserRoles.user,
      operations: [{ operationId: 'op-1', operationUserRoleLabelId: 3 }]
    } as any;

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.notification-detail-link')).toBeNull();
  });

  it('skips notification reply hydration for care rep access on the patient operation', () => {
    jest.clearAllMocks();
    component.user = {
      userId: 'u2',
      userLevel: UserRoles.user,
      operations: [{ operationId: 'op-1', operationUserRoleLabelId: 3 }]
    } as any;
    component.patientActivity = [];

    component.ngOnInit();

    expect(notificationServiceStub.getNotificationRepliesByPatientId).not.toHaveBeenCalled();
  });

  it('hides View / Reply when the user has manager access on a different operation only', () => {
    component.user = {
      userId: 'u3',
      userLevel: UserRoles.manager,
      operations: [{ operationId: 'op-2', operationUserRoleLabelId: 2 }]
    } as any;

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.notification-detail-link')).toBeNull();
  });
});
