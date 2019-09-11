import { Component, OnInit, Input } from '@angular/core';
import { PatientCall } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { PatientCallQuestionsService, PatientCallQuestion } from './patient-call-questions.service';

@Component({
  selector: 'app-patient-call-questions',
  templateUrl: './patient-call-questions.component.html',
  styleUrls: ['./patient-call-questions.component.scss']
})
export class PatientCallQuestionsComponent implements OnInit {
  @Input() patientCall: PatientCall;
  questions: PatientCallQuestion[];
  questions$: Observable<PatientCallQuestion[]>;
  constructor(private patientCallQuestionsService: PatientCallQuestionsService) {}

  ngOnInit() {
    this.questions$ = this.patientCallQuestionsService.getPatientCallQuestionsByPatientCallId(
      this.patientCall.patientCallId
    );
  }
}
