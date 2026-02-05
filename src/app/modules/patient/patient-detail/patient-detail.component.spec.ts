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
  const patientFixture: any = {
    patientId: 'p1',
    patientOperationId: 'op1',
    nextPatientCallId: 'pc1',
    patientCalls$: of([])
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
                data: { user: { userId: 'u1' }, patient: patientFixture },
                params: {},
                queryParams: {}
              }
            }
          },
          { provide: PatientCallService, useValue: patientCallServiceMock },
          { provide: NotificationService, useValue: notificationServiceMock },
          { provide: PatientCallNotesService, useValue: patientCallNotesServiceMock },
          { provide: PatientCallQuestionsService, useValue: patientCallQuestionsServiceMock },
          { provide: UserService, useValue: userServiceMock },
          { provide: ToastrService, useValue: toastrMock }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDetailComponent);
    component = fixture.componentInstance;
    component.patient = { ...patientFixture } as any;
    fixture.detectChanges();
    component.patientCall = { patientCallId: 'pc1', patientId: 'p1' } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts a patient call and marks as started', () => {
    component.patientCall.patientCallStatusLabel = '';
    component.patientCallStartEventHandler('u1');

    expect(patientCallServiceMock.startPatientCallByUserIdAndPatientCallId).toHaveBeenCalledWith('u1', 'pc1');
    expect(component.patientCall.patientCallStatusLabel).toBe('Started');
  });

  it('alerts instead of ending when status is Started', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.patientCall.patientCallStatusLabel = 'Started';
    component.patientCallEndEventHandler(component.patientCall);

    expect(alertSpy).toHaveBeenCalled();
    expect(patientCallServiceMock.endPatientCall).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('ends call and sets label when status not Started', () => {
    component.patientCall.patientCallStatusLabel = 'Done';
    component.patientCallEndEventHandler(component.patientCall);

    expect(patientCallServiceMock.endPatientCall).toHaveBeenCalledWith('pc1');
    expect(component.patientCall.patientCallStatusLabel).toBe('In Review');
  });

  it('updates status label and id on status change', () => {
    component.patientCall.patientCallStatusLabel = 'In Progress';
    component.patientCallStatusLabelChangeHandler('status-1');

    expect(component.patientCall.patientCallStatusLabelId).toBe('status-1');
    expect(component.patientCall.patientCallStatusLabel).toBe('User Selected Status');
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
    const finalizeNavigateSpy = jest.spyOn<any>(component, 'finalizeCallAndNavigate').mockImplementation(() => {});
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
    const scrollSpy = jest.fn();
    document.body.innerHTML = '<div id="next-call-calendar"></div>';
    (document.querySelector('#next-call-calendar') as any).scrollIntoView = scrollSpy;
    component.patientNextCall.date = '';
    component.patientCall = { patientCallStatusLabel: 'In Review', finalCall: false } as any;

    component.patientCallFinishEventHandler(component.patientCall);

    expect(alertSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalled();
    expect(patientCallNotesServiceMock.addPatientCallNotesByPatientCallId).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('finalizes final call and navigates', async () => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
    component.patient = { patientOperationId: 'op1' } as any;
    component.user = { userId: 'u1' } as any;
    component.patientCall = { patientCallId: 'pc1', finalCall: true } as any;

    await (component as any).finalizeCallAndNavigate();

    expect(userServiceMock.updateOperations).toHaveBeenCalled();
    expect(window.location.href).toContain('/call-queue/operations/op1');
  });
});
