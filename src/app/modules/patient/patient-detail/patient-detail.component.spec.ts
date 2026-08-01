import { NO_ERRORS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PatientCallService } from './patient-call/patient-call.service';
import { PatientDetailComponent } from './patient-detail.component';
import { NotificationService } from '@app/modules/notification/notification.service';
import { PatientCallNotesService } from './patient-call/patient-call-notes/patient-call-notes.service';
import { PatientCallQuestionsService } from './patient-call/patient-call-questions/patient-call-questions.service';
import { UserService } from '@app/modules/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { PatientStatusService } from '../patient-status.service';

describe('PatientDetailComponent', () => {
  let component: PatientDetailComponent;
  let fixture: ComponentFixture<PatientDetailComponent>;
  const patientCallServiceMock: any = {
    getPatientCallByPatientCallId: jest.fn(() => of([{ patientCallId: 'pc1', patientId: 'p1' }])),
    startPatientCallByUserIdAndPatientCallId: jest.fn(() => of({})),
    endPatientCall: jest.fn(() => of({})),
    addNewPatientCallByPatientId: jest.fn(() => of({})),
    finalizePatientCall: jest.fn(() => of({}))
  };
  const notificationServiceMock: any = { getNotificationsByPatientId: jest.fn(() => of([])) };
  const patientCallNotesServiceMock: any = { addPatientCallNotesByPatientCallId: jest.fn(() => of({})) };
  const patientCallQuestionsServiceMock: any = {
    addPatientCallQuestionAnswersByPatientCallQuestionId: jest.fn(() => of({}))
  };
  const userServiceMock: any = { updateOperations: jest.fn(() => Promise.resolve()) };
  const toastrMock: any = { success: jest.fn(), error: jest.fn() };
  const patientStatusServiceMock: any = { getPatientStatusLabels: jest.fn(() => of([])) };
  const patientFixture: any = {
    patientId: 'p1',
    patientOperationId: 'op1',
    nextPatientCallId: 'pc1',
    patientCalls$: of([]),
    patientActive: 1,
    patientGraduated: false,
    patientStatusLabel: 'In Progress'
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientDetailComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: { user: { userId: 'u1' }, patient: patientFixture, followupReadOnly: false },
                params: {},
                queryParams: {}
              }
            }
          },
          { provide: PatientCallService, useValue: patientCallServiceMock },
          { provide: NotificationService, useValue: notificationServiceMock },
          { provide: PatientCallNotesService, useValue: patientCallNotesServiceMock },
          { provide: PatientCallQuestionsService, useValue: patientCallQuestionsServiceMock },
          { provide: PatientStatusService, useValue: patientStatusServiceMock },
          { provide: UserService, useValue: userServiceMock },
          { provide: ToastrService, useValue: toastrMock }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    jest.clearAllMocks();
    fixture = TestBed.createComponent(PatientDetailComponent);
    component = fixture.componentInstance;
    (component as any).patientCallService = patientCallServiceMock;
    (component as any).patientCallNotesService = patientCallNotesServiceMock;
    (component as any).patientCallQuestionsService = patientCallQuestionsServiceMock;
    (component as any).notificationService = notificationServiceMock;
    component.patient = { ...patientFixture } as any;
    fixture.detectChanges();
    component.patientCall = { patientCallId: 'pc1', patientId: 'p1' } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prefetches completion options for active follow-up patients', () => {
    expect(patientStatusServiceMock.getPatientStatusLabels).toHaveBeenCalled();
  });

  it('starts a patient call and marks as started', () => {
    component.patientCall.patientCallStatusLabel = '';
    component.patientCallStartEventHandler('u1');

    expect(patientCallServiceMock.startPatientCallByUserIdAndPatientCallId).toHaveBeenCalledWith('u1', 'pc1');
    expect(component.patientCall.patientCallStatusLabel).toBe('Started');
  });

  it('locks follow-up actions for completed or inactive patients', () => {
    component.patient = { ...patientFixture, patientGraduated: true } as any;
    expect(component.isFollowupLocked).toBe(true);

    component.patient = { ...patientFixture, patientGraduated: false, patientActive: 0 } as any;
    expect(component.isFollowupLocked).toBe(true);

    component.patient = { ...patientFixture, patientGraduated: false, patientActive: 1, patientStatusLabel: 'Completed' } as any;
    expect(component.isFollowupLocked).toBe(true);

    component.patient = { ...patientFixture, patientGraduated: false, patientActive: 1 } as any;
    expect(component.isFollowupLocked).toBe(false);
  });

  it('locks follow-up actions on history routes even when the patient is otherwise active', () => {
    component.followupReadOnly = true;
    component.patient = { ...patientFixture, patientGraduated: false, patientActive: 1 } as any;

    expect(component.isFollowupLocked).toBe(true);
    expect(component.followupLockMessage).toBe(
      'This is the patient history view. Follow-up actions are unavailable here, but notifications are still available.'
    );
  });

  it('uses non-completion copy for locked non-history patients', () => {
    component.followupReadOnly = false;
    component.patient = { ...patientFixture, patientGraduated: true, patientActive: 1 } as any;

    expect(component.followupLockMessage).toBe(
      'Follow-up is unavailable for this patient in the current status, but notifications are still available.'
    );
  });

  it('does not start a patient call when the patient is not in progress', () => {
    component.patient = { ...patientFixture, patientGraduated: false, patientActive: 1, patientStatusLabel: 'Completed' } as any;

    component.patientCallStartEventHandler('u1');

    expect(patientCallServiceMock.startPatientCallByUserIdAndPatientCallId).not.toHaveBeenCalled();
  });

  it('does not start a patient call when follow-up is locked', () => {
    component.patient = { ...patientFixture, patientGraduated: true } as any;

    component.patientCallStartEventHandler('u1');

    expect(patientCallServiceMock.startPatientCallByUserIdAndPatientCallId).not.toHaveBeenCalled();
  });

  it('shows inline validation and scrolls to the call status controls when status is Started', () => {
    const scrollIntoView = jest.fn();
    const querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue({ scrollIntoView } as any);
    component.patientCall.patientCallStatusLabel = 'Started';

    component.patientCallEndEventHandler(component.patientCall);
    fixture.detectChanges();

    expect(patientCallServiceMock.endPatientCall).not.toHaveBeenCalled();
    expect(component.showPatientCallStatusValidation).toBe(true);
    expect(querySelectorSpy).toHaveBeenCalledWith('#patient-call-status-field');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(fixture.nativeElement.textContent).toContain('Please select a call status before stopping the call.');

    querySelectorSpy.mockRestore();
  });

  it('ends call and sets label when status not Started', () => {
    const scrollIntoView = jest.fn();
    const querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue({ scrollIntoView } as any);
    component.patientCall.patientCallStatusLabel = 'Done';
    component.patientCallEndEventHandler(component.patientCall);

    expect(patientCallServiceMock.endPatientCall).toHaveBeenCalledWith('pc1');
    expect(component.patientCall.patientCallStatusLabel).toBe('In Review');
    expect(querySelectorSpy).toHaveBeenCalledWith('#patient-detail-review-top');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    querySelectorSpy.mockRestore();
  });

  it('updates status label and id on status change', () => {
    component.showPatientCallStatusValidation = true;
    component.patientCall.patientCallStatusLabel = 'In Progress';

    component.patientCallStatusLabelChangeHandler('status-1');

    expect(component.patientCall.patientCallStatusLabelId).toBe('status-1');
    expect(component.patientCall.patientCallStatusLabel).toBe('User Selected Status');
    expect(component.showPatientCallStatusValidation).toBe(false);
  });

  it('blocks status change for restricted labels', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.patientCall.patientCallStatusLabel = 'Scheduled';
    component.patientCallStatusLabelChangeHandler('blocked');

    expect(alertSpy).toHaveBeenCalled();
    expect(component.patientCall.patientCallStatusLabelId).toBeUndefined();
    alertSpy.mockRestore();
  });

  it('formats and stores next call date selection', () => {
    component.patientNextCallDateSelectedEventHandler('2024-01-02');
    expect(component.patientNextCall.date).toBe('01-02-2024');
  });

  it('toggles final call flag', () => {
    component.patientCall.finalCall = false;
    component.patientFinalCallChangeHandler(true);
    expect(component.patientCall.finalCall).toBe(true);
  });

  it('finishes call when next date exists and questions answered', () => {
    const finalizeNavigateSpy = jest.spyOn(component as any, 'finalizeCallAndNavigate').mockImplementation(() => {});
    component.patientNextCall.date = '01-02-2024';
    component.patientCall = { ...component.patientCall, finalCall: false } as any;
    component.patientCallNotes = { patientCallNotes: 'note' } as any;
    component.patientCallQuestionAnswers = [{ q1: 'yes' } as any];

    component.patientCallFinishEventHandler(component.patientCall);

    expect(patientCallNotesServiceMock.addPatientCallNotesByPatientCallId).toHaveBeenCalledWith('pc1', 'note', 0);
    expect(patientCallServiceMock.finalizePatientCall).toHaveBeenCalled();
    expect(patientCallQuestionsServiceMock.addPatientCallQuestionAnswersByPatientCallQuestionId).toHaveBeenCalledWith(
      'q1',
      'yes'
    );
    expect(finalizeNavigateSpy).toHaveBeenCalled();
    finalizeNavigateSpy.mockRestore();
  });

  it('alerts and returns when next call date missing', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.patientNextCall.date = '';
    component.patientCall = { patientCallStatusLabel: 'In Review', finalCall: false } as any;

    component.patientCallFinishEventHandler(component.patientCall);

    expect(alertSpy).toHaveBeenCalled();
    expect(patientCallNotesServiceMock.addPatientCallNotesByPatientCallId).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('finalizes final call and navigates', async () => {
    const navigateSpy = jest.spyOn<any, any>(component as any, 'navigateTo').mockImplementation(() => undefined);
    component.patient = { patientOperationId: 'op1' } as any;
    component.user = { userId: 'u1' } as any;
    component.patientCall = { patientCallId: 'pc1', finalCall: true } as any;

    await (component as any).finalizeCallAndNavigate();

    expect(userServiceMock.updateOperations).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/call-queue/operations/op1');
  });
});
