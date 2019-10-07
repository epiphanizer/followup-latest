import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '@app/modules/patient/patient';
import { PatientCall, PatientCallQuestionAnswer } from '../../patient-call/patient-call.service';
import { Observable } from 'rxjs';
import {
  PatientCallQuestion,
  PatientCallQuestionsService
} from '../patient-call-questions/patient-call-questions.service';

@Component({
  providers: [PatientCallQuestionsService],
  selector: 'app-patient-call-history-listing',
  templateUrl: './patient-call-history-listing.component.html',
  styleUrls: ['./patient-call-history-listing.component.scss']
})
export class PatientCallHistoryListingComponent implements OnInit {
  @Input() patientCalls: PatientCall[];
  patientCallQuestions: PatientCallQuestion[] = [];

  constructor(
    private patientCallQuestionService: PatientCallQuestionsService,
    private patientCallQuestionAnswerService: PatientCallQuestionsService
  ) {}

  ngOnInit() {
    // Go get our calls and warm up the observables.
    this.patientCalls.forEach((patientCall: PatientCall) => {
      patientCall.patientCallQuestions$ = this.patientCallQuestionService
        .getPatientCallQuestionsByPatientCallId(patientCall.patientCallId)
        .map((patientCallQuestions: PatientCallQuestion[]) => {
          patientCallQuestions.forEach((patientCallQuestion: PatientCallQuestion) => {
            patientCallQuestion.patientCallQuestionAnswer$ = this.patientCallQuestionAnswerService.getPatientCallQuestionAnswersByPatientCallQuestionId(
              patientCallQuestion.patientCallQuestionId
            );
          });
        });
    });
  }
}
