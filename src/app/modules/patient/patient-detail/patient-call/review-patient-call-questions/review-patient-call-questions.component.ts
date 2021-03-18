import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { PatientCallQuestion } from '../patient-call-questions/patient-call-questions.service';

@Component({
  selector: 'app-review-patient-call-questions',
  templateUrl: './review-patient-call-questions.component.html',
  styleUrls: ['./review-patient-call-questions.component.scss']
})
export class ReviewPatientNextCallQuestionsComponent implements OnInit {
  @Input() patientCallQuestions: PatientCallQuestion[];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    console.log(this.patientCallQuestions);
  }
}
