import { Component, OnInit, Input } from '@angular/core';
import { PatientCallService, PatientCall } from '../../patient-call/patient-call.service';

@Component({
  selector: 'app-patient-call-questions',
  templateUrl: './patient-call-questions.component.html',
  styleUrls: ['./patient-call-questions.component.scss']
})
export class PatientCallQuestionsComponent implements OnInit {
  @Input() patientCall: PatientCall;
  questions: <PatientCallQuestions>[];
  constructor(private patientCallService: PatientCallService) {}

  ngOnInit() {
    this.questions = this.patientCallService.getPatientCallQuestionsByPatientCallId(this.patientCall.patientCallId);
  }
}
