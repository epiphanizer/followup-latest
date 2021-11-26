import { Component, OnInit, Input } from '@angular/core';
import { PatientCallQuestion } from '../patient-call-questions/patient-call-questions.service';

@Component({
  selector: 'app-review-patient-call-questions',
  templateUrl: './review-patient-call-questions.component.html',
  styleUrls: ['./review-patient-call-questions.component.scss']
})
export class ReviewPatientNextCallQuestionsComponent implements OnInit {
  @Input() patientCallQuestions: PatientCallQuestion[];

  constructor() {}

  ngOnInit() {}
}
