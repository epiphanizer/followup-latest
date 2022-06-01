import { Component, OnInit, ViewChild } from '@angular/core';
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
import { PatientCallStatus, PatientCallStatuses } from './patient-call/patient-call-status.service';
import { formatDate } from '@angular/common';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '@app/modules/notification/notification.service';
import { Notification } from '@app/modules/notification/notification';
import { UserService } from '@app/modules/user/user.service';

@Component({
  providers: [PatientCallService, PatientCallNotesService, PatientCallQuestionsService],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  user: User;
  patient: Patient = null;
  operation: Operation;
  patientCall: PatientCall;
  patientCall$: Observable<PatientCall>;
  patientCallNotes: PatientCallNotes;
  patientCallNotesHighlighted: number = 0;
  patientCallQuestions: PatientCallQuestion[];
  patientCallQuestionAnswers: PatientCallQuestionAnswer[];
  patientCallStatuses: any | typeof PatientCallStatuses = PatientCallStatuses;

  patientNextCall: {
    date: string;
    patientCallStatusLabelId: string;
  };
  patientNextCallQuestions: PatientCallQuestion[];

  constructor(
    private userService: UserService,
    private patientCallService: PatientCallService,
    private notificationService: NotificationService,
    private patientCallNotesService: PatientCallNotesService,
    private patientCallQuestionsService: PatientCallQuestionsService,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.patient = this.route.snapshot.data.patient;
    this.patientCall$ = this.patientCallService
      .getPatientCallByPatientCallId(this.patient.patientId, this.patient.nextPatientCallId)
      .pipe(
        take(1),
        map((patientCall: PatientCall) => {
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

  patientCallStartEventHandler(userId: string) {
    this.patientCallService
      .startPatientCallByUserIdAndPatientCallId(userId, this.patientCall.patientCallId)
      .subscribe((data: any) => {
        this.patientCall.patientCallStatusLabelId = 'XAE2oKVR';
        this.patientCall.patientCallStatusLabel = 'Started';
      });
  }

  patientCallEndEventHandler($event: PatientCall) {
    this.patientCall = $event;

    if (this.patientCall.patientCallStatusLabel == 'Started') {
      return;
    }
    this.patientCallService.endPatientCall(this.patientCall.patientCallId);
    /**
     * Change the label, but not the ID.
     */
    this.patientCall.patientCallStatusLabel = 'In Review';
  }

  patientCallStatusLabelChangeHandler($event: string) {
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
    if ($event == true) {
      this.patientCall.finalCall = true;
    } else {
      this.patientCall.finalCall = false;
    }
  }

  patientNextCallDateSelectedEventHandler($event: string) {
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

  patientCallQuestionsChangeHandler($event: PatientCallQuestionAnswer[]) {
    this.patientCallQuestionAnswers = $event;
  }

  patientNextCallQuestionsChangeHandler($event: PatientCallQuestion[]) {
    this.patientNextCallQuestions = $event;
  }

  patientCallFinishEventHandler($event: PatientCall) {
    this.patientCall = $event;
    if (!this.patientCallNotes) {
      alert('Please add patient call notes');
      return;
    }

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
    /**
     * Passing E2E
     */
    this.patientCallNotesService
      .addPatientCallNotesByPatientCallId(
        this.patientCall.patientCallId,
        this.patientCallNotes.patientCallNotes,
        this.patientCallNotesHighlighted
      )
      .subscribe((res: any) => {
        this.patientCallService.finalizePatientCall(this.patientCall).subscribe((data: any) => {
          // Update the call status
          // Talk to our service to answer the existing call questions
          if (this.patientCallQuestionAnswers) {
            this.patientCallQuestionAnswers.forEach((patientCallQuestionAnswer: PatientCallQuestionAnswer) => {
              let patientCallQuestionId = Object.keys(patientCallQuestionAnswer).toString();
              let patientCallQuestionAnswerText = patientCallQuestionAnswer[patientCallQuestionId];
              if (patientCallQuestionAnswerText !== undefined) {
                this.patientCallQuestionsService
                  .addPatientCallQuestionAnswersByPatientCallQuestionId(
                    patientCallQuestionId,
                    patientCallQuestionAnswerText
                  )
                  .subscribe();
              }
            });
          }
          let navigateToUrl = '/call-queue/operations/' + this.patient.patientOperationId;

          if (this.patientCall.finalCall) {
            this.toastrService.success('Successfully Saved');
            this.userService.updateOperations(this.user).then(res => {
              window.location.href = navigateToUrl;
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
            this.patientCallService
              .addNewPatientCallByPatientId(this.patient.patientId, isoString)
              .subscribe((data: any) => {
                let patientCallId = data.patientCallId;
                let itemsProcessed = 0;
                if (this.patientNextCallQuestions.length) {
                  this.patientNextCallQuestions.forEach((patientCallQuestion: PatientCallQuestion, index: number) => {
                    if (patientCallQuestion.patientCallQuestion != '') {
                      this.patientCallQuestionsService
                        .addPatientCallQuestionByPatientCallId(patientCallId, patientCallQuestion)
                        .subscribe((data: any) => {
                          itemsProcessed++;
                          if (itemsProcessed === this.patientNextCallQuestions.length) {
                            this.toastrService.success('Successfully Saved');
                            this.userService.updateOperations(this.user).then(res => {
                              window.location.href = navigateToUrl;
                            });
                          }
                        });
                    } else {
                      this.patientNextCallQuestions.splice(index, 1);
                    }
                  });
                } else {
                  this.toastrService.success('Successfully Saved');
                  this.userService.updateOperations(this.user).then(res => {
                    window.location.href = navigateToUrl;
                  });
                }
              });
          }
        });
      });
  }
  ngOnDestroy() {}
}
