import { Component, OnInit, Input } from '@angular/core';
import { PatientCall, PatientCallQuestionAnswer } from '../../patient-call/patient-call.service';
import {
  PatientCallQuestion,
  PatientCallQuestionsService
} from '../patient-call-questions/patient-call-questions.service';
import { map } from 'rxjs/operators';

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
                    if (!patientCallQuestionAnswer != null) {
                      if (this.patientCalls[index].patientCallQuestions[idx]) {
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
  }
}
