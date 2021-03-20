import { Component, OnInit, Input } from '@angular/core';
import {
  PatientCall,
  PatientCallQuestionAnswer
} from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import {
  PatientCallQuestion,
  PatientCallQuestionsService
} from '@app/modules/patient/patient-detail/patient-call/patient-call-questions/patient-call-questions.service';
import { map } from 'rxjs/operators';
import { Notification } from '@app/modules/notification/notification';
import { Patient } from '../../patient';

@Component({
  providers: [PatientCallQuestionsService],
  selector: 'app-patient-history-listing',
  templateUrl: './patient-history-listing.component.html',
  styleUrls: ['./patient-history-listing.component.scss']
})
export class PatientHistoryListingComponent implements OnInit {
  @Input() patient: Patient;
  @Input() patientCalls: PatientCall[];
  @Input() patientNotifications: Notification[];
  patientActivity: [Notification[] | PatientCall[]] | any;
  patientHistory: PatientCall[];
  patientCallQuestions: PatientCallQuestion[] = [];

  constructor(
    private patientCallQuestionService: PatientCallQuestionsService,
    private patientCallQuestionAnswerService: PatientCallQuestionsService
  ) {}

  returnHTML(value: string): string {
    return value
      .replace(/%0A/g, '<br/>')
      .replace(/%20/g, '&nbsp;')
      .replace(/%22/g, '"');
  }
  ngOnInit() {
    this.patientActivity = [];
    // Go get our calls and warm up the observables.
    this.patientCalls.forEach((patientCall: PatientCall, index: number) => {
      this.patientCallQuestionService
        .getPatientCallQuestionsByPatientCallId(patientCall.patientCallId)
        .subscribe((patientCallQuestions: PatientCallQuestion[]) => {
          this.patientCalls[index].patientCallQuestions = patientCallQuestions;
          this.patientCalls[index].patientCallQuestions.forEach(
            (patientCallQuestion: PatientCallQuestion, idx: number) => {
              this.patientCallQuestionAnswerService
                .getPatientCallQuestionAnswersByPatientCallQuestionId(patientCallQuestion.patientCallQuestionId)
                .pipe(
                  map((patientCallQuestionAnswer: PatientCallQuestionAnswer) => {
                    if (patientCallQuestionAnswer != null) {
                      if (
                        this.patientCalls[index].patientCallQuestions[idx] &&
                        patientCallQuestionAnswer[0].patientCallQuestionAnswer
                      ) {
                        this.patientCalls[index].patientCallQuestions[idx].patientCallQuestionAnswer =
                          patientCallQuestionAnswer[0].patientCallQuestionAnswer;
                      }
                    }
                  })
                )
                .subscribe();
            }
          );
        });
    });

    /**
     * Combine the patientCalls and patientNotifications and sort them by the date that they occurred.
     */
    if (this.patientCalls) {
      this.patientCalls.forEach(patientCall => {
        patientCall.patientCallNotes = this.returnHTML(patientCall.patientCallNotes);
        console.log(patientCall.patientCallNotes);
        this.patientActivity.push(patientCall);
      });
    }
    if (this.patientNotifications) {
      this.patientNotifications.forEach(patientNotification => {
        patientNotification.notificationMessage = this.returnHTML(patientNotification.notificationMessage);
        this.patientActivity.push(patientNotification);
      });
    }

    this.patientActivity = this.patientActivity.sort(function(a: any, b: any) {
      var createdDate = a.notificationCreatedTime ? a.notificationCreatedTime : a.patientCallEndTime;
      var createdCompareDate = b.notificationCreatedTime ? b.notificationCreatedTime : b.patientCallEndTime;
      return new Date(createdCompareDate).getTime() - new Date(createdDate).getTime();
    });
  }
}
