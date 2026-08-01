import { Component, OnInit } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import {
  PatientCall,
  PatientCallService,
  PatientCallQuestionAnswer
} from '../patient-detail/patient-call/patient-call.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { Operation } from '@app/modules/operation/operation';
import {
  PatientCallNotesService,
  PatientCallNotes
} from './patient-call/patient-call-notes/patient-call-notes.service';
import {
  PatientCallQuestionsService,
  PatientCallQuestion
} from './patient-call/patient-call-questions/patient-call-questions.service';
import { PatientCallStatuses } from './patient-call/patient-call-status.service';
import { formatDate } from '@angular/common';
import { catchError, map, take } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Notification } from '@app/modules/notification/notification';
import { UserService } from '@app/modules/user/user.service';
import { PatientStatusService } from '../patient-status.service';

@Component({
  providers: [PatientCallService, PatientCallNotesService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
  standalone: false
})
export class PatientDetailComponent implements OnInit {
  user: User;
  patient: Patient = null;
  operation: Operation;
  followupReadOnly: boolean = false;
  patientCall: PatientCall;
  patientCall$: Observable<PatientCall>;
  patientCallNotes: PatientCallNotes;
  patientCallNotesHighlighted: number = 0;
  patientCallQuestions: PatientCallQuestion[];
  patientCallQuestionAnswers: Array<Record<string, string | number>>;
  patientCallStatuses: any | typeof PatientCallStatuses = PatientCallStatuses;
  patientLastCallAnswers: Array<Record<string, string | number>>;

  patientNextCall: {
    date: string;
    patientCallStatusLabelId: string;
  };
  patientNextCallQuestions: PatientCallQuestion[];

  get isFollowupLocked(): boolean {
    return (
      this.followupReadOnly ||
      this.isPatientInactive(this.patient) ||
      this.isPatientCompleted(this.patient) ||
      this.isPatientOutsideFollowupWorkflow(this.patient)
    );
  }

  get followupLockMessage(): string {
    if (this.followupReadOnly) {
      return 'This is the patient history view. Follow-up actions are unavailable here, but notifications are still available.';
    }

    return 'Follow-up is unavailable for this patient in the current status, but notifications are still available.';
  }

  constructor(
    private userService: UserService,
    private patientCallService: PatientCallService,
    private notificationService: NotificationService,
    private patientCallNotesService: PatientCallNotesService,
    private patientCallQuestionsService: PatientCallQuestionsService,
    private patientStatusService: PatientStatusService,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.followupReadOnly = !!this.route.snapshot.data.followupReadOnly;

    if (!this.isFollowupLocked) {
      this.patientStatusService
        .getPatientStatusLabels()
        .pipe(take(1))
        .subscribe({
          error: () => undefined
        });
    }

    this.patientCall$ = this.patientCallService
      .getPatientCallByPatientCallId(this.patient.patientId, this.patient.nextPatientCallId)
      .pipe(
        take(1),
        map((patientCall: [PatientCall]) => {
          this.patientCall = patientCall[0];
          return this.patientCall;
        })
      );

    this.patient.patientCalls$.subscribe((patientCalls: PatientCall[]) => {
      if (patientCalls != null) {
        this.patient.patientCalls = patientCalls;
      } else {
        this.patient.patientCalls = [];
      }
    });

    this.patientNextCall = {
      date: '',
      patientCallStatusLabelId: null
    };
    this.patientNextCallQuestions = [];

    if (this.patient?.patientId) {
      this.patient.patientNotifications$ = this.notificationService
        .getNotificationsByPatientId(this.patient.patientId)
        .pipe(
          take(1),
          map((notifications: Notification[]) => {
            if (notifications != null) {
              this.patient.patientNotifications = notifications;
            } else {
              this.patient.patientNotifications = [];
            }
            return this.patient.patientNotifications;
          })
        );
      this.patient.patientNotifications$.subscribe((notifications: Notification[]) => {
        this.patient.patientNotifications = notifications;
      });
    }
  }

  patientCallStartEventHandler(userId: string) {
    if (this.isFollowupLocked) {
      return;
    }

    this.patientCallService
      .startPatientCallByUserIdAndPatientCallId(userId, this.patientCall.patientCallId)
      .pipe(
        catchError((err, obs) => {
          if (err.status == 400) {
            alert('It looks like this call has already finished!');
          }
          var unstick = confirm('Unstick patient?');
          if (unstick) {
            let newDate = formatDate(Date.now(), 'MM-dd-yyyy', 'en-US');

            var dateArray = newDate.split('-');
            var isoString = dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1] + 'T12:00:00.000Z';
            this.patientCallService
              .addNewPatientCallByPatientId(this.patientCall.patientId, isoString)
              .subscribe(res => {
                if (res) {
                  this.toastrService.success('Patient unstuck!');
                  this.reloadPage();
                }
              });
          }
          return err;
        })
      )
      .subscribe((data: any) => {
        this.patientCall.patientCallStatusLabelId = 'XAE2oKVR';
        this.patientCall.patientCallStatusLabel = 'Started';
      });
  }

  patientCallEndEventHandler($event: PatientCall) {
    if (this.isFollowupLocked) {
      return;
    }

    this.patientCall = $event;
    if (this.patientCall.patientCallStatusLabel == 'Started') {
      alert('Please select a call status');
      return;
    }
    this.patientCallService.endPatientCall(this.patientCall.patientCallId);
    /**
     * Change the label, but not the ID.
     */
    this.patientCall.patientCallStatusLabel = 'In Review';
    this.scrollReviewPaneToTop();
  }

  patientCallStatusLabelChangeHandler($event: string) {
    if (this.isFollowupLocked) {
      return;
    }

    if (
      this.patientCall.patientCallStatusLabel == 'New Discharge' ||
      this.patientCall.patientCallStatusLabel == 'Scheduled'
    ) {
      alert('Please begin call first.');
      return;
    }
    let patientCallStatusLabelId = $event;
    this.patientCall.patientCallStatusLabelId = patientCallStatusLabelId;
    this.patientCall.patientCallStatusLabel = 'User Selected Status';
  }

  patientFinalCallChangeHandler($event: boolean) {
    if (this.isFollowupLocked) {
      return;
    }

    if ($event == true) {
      this.patientCall.finalCall = true;
    } else {
      this.patientCall.finalCall = false;
    }
  }

  patientNextCallDateSelectedEventHandler($event: string) {
    if (this.isFollowupLocked) {
      return;
    }

    let selectedDate = $event;
    let newDate = formatDate(selectedDate, 'MM-dd-yyyy', 'en-US');
    this.patientNextCall.date = newDate;
  }

  patientCallNotesChangeHandler($event: PatientCallNotes) {
    this.patientCallNotes = $event;
  }

  patientCallNotesHighlightedChangeHandler($event: number) {
    this.patientCallNotesHighlighted = $event;
  }

  patientCallQuestionsChangeHandler($event: Array<Record<string, string | number>>) {
    this.patientCallQuestionAnswers = $event;
  }

  private isPatientCallQuestionAnswer(answer: unknown): answer is PatientCallQuestionAnswer {
    return (
      typeof answer === 'object' &&
      answer !== null &&
      'patientCallQuestionId' in answer &&
      'patientCallQuestionAnswer' in answer
    );
  }

  patientCallFinishEventHandler($event: PatientCall) {
    if (this.isFollowupLocked) {
      return;
    }

    this.patientCall = $event;

    if (!this.patientNextCall.date && !this.patientCall.finalCall) {
      alert('Please select a valid next patient call date');
      return;
    }
    if (!this.patientNextCall.date && !this.patientCall.finalCall) {
      alert('Please schedule a call date.');
      let element = document.querySelector('#next-call-calendar');
      if (element) {
        element.scrollIntoView({
          behavior: 'auto',
          block: 'start'
        });
      }
      return;
    }

    this.patientCallNotesService
      .addPatientCallNotesByPatientCallId(
        this.patientCall.patientCallId,
        this.patientCallNotes?.patientCallNotes || '',
        this.patientCallNotesHighlighted
      )
      .subscribe((res: any) => {
        this.patientCallService.finalizePatientCall(this.patientCall).subscribe((data: any) => {
          // Update the call status
          // Talk to our service to answer the existing call questions
          if (this.patientCallQuestionAnswers) {
            const observables = this.patientCallQuestionAnswers
              .map(answer => {
                if (!answer) {
                  return null;
                }

                if (this.isPatientCallQuestionAnswer(answer)) {
                  return this.patientCallQuestionsService.addPatientCallQuestionAnswersByPatientCallQuestionId(
                    answer.patientCallQuestionId,
                    answer.patientCallQuestionAnswer
                  );
                }

                const answerRecord = answer as Record<string, string | number>;
                const patientCallQuestionId = Object.keys(answerRecord)[0];
                const patientCallQuestionAnswerText = answerRecord[patientCallQuestionId];

                if (patientCallQuestionId && patientCallQuestionAnswerText !== undefined) {
                  return this.patientCallQuestionsService.addPatientCallQuestionAnswersByPatientCallQuestionId(
                    patientCallQuestionId,
                    String(patientCallQuestionAnswerText)
                  );
                }
                return null;
              })
              .filter(obs => obs !== null); // Filter out any nulls in case answer text was undefined

            if (observables.length > 0) {
              forkJoin(observables).subscribe({
                next: () => {
                  // Continue with the rest of the flow after submitting the answers
                  this.finalizeCallAndNavigate();
                },
                error: err => {
                  console.error('An error occurred while submitting patient call question answers:', err);
                  // Handle error appropriately here
                }
              });
            } else {
              // If there are no valid observables, just finalize the call and navigate
              this.finalizeCallAndNavigate();
            }
          } else {
            // If there are no questions to answer, just finalize the call and navigate
            this.finalizeCallAndNavigate();
          }
        });
      });
  }

  private finalizeCallAndNavigate() {
    let navigateToUrl = '/call-queue/operations/' + this.patient.patientOperationId;

    if (this.patientCall.finalCall) {
      /**
       * This is a slow operation query wise.
       */
      this.userService.updateOperations(this.user).then(res => {
        this.toastrService.success('Successfully Saved');
        this.navigateTo(navigateToUrl);
      });
    } else {
      /**
       * Doing it this way stops some cross-browser parsing things
       * that happen when we convert it to a new Date() first.
       */
      var dateArray = this.patientNextCall.date.split('-');
      var isoString = dateArray[2] + '-' + dateArray[0] + '-' + dateArray[1] + 'T12:00:00.000Z';
      /**
       * Passing E2E
       */
      this.patientCallService.addNewPatientCallByPatientId(this.patient.patientId, isoString).subscribe((data: any) => {
        this.userService.updateOperations(this.user).then(res => {
          this.toastrService.success('Successfully Saved');
          this.navigateTo(navigateToUrl);
        });
      });
    }
  }

  private navigateTo(url: string): void {
    window.location.href = url;
  }

  private scrollReviewPaneToTop(): void {
    const reviewPaneTop = document.querySelector('#patient-detail-review-top');
    if (reviewPaneTop) {
      reviewPaneTop.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  private reloadPage(): void {
    window.location.reload();
  }

  private isPatientCompleted(patient: Patient | null): boolean {
    return Boolean(patient?.patientGraduated);
  }

  private isPatientOutsideFollowupWorkflow(patient: Patient | null): boolean {
    const statusLabel = patient?.patientStatusLabel?.trim() || patient?.patientCurrentStatusLabel?.trim();

    if (!statusLabel) {
      return false;
    }

    return statusLabel.toLowerCase() !== 'in progress';
  }

  private isPatientInactive(patient: Patient | null): boolean {
    if (typeof patient?.patientActive === 'undefined' || patient?.patientActive === null) {
      return false;
    }

    return Number(patient.patientActive) !== 1;
  }

  ngOnDestroy() {}
}
