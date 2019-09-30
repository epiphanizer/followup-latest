import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PatientCallService, PatientCall } from '../patient-call.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-next-call-questions',
  templateUrl: './patient-next-call-questions.component.html',
  styleUrls: ['./patient-next-call-questions.component.scss']
})
export class PatientNextCallQuestionsComponent implements OnInit {
  nextQuestionsForm: FormGroup;
  constructor(private fb: FormBuilder) {}
  patientCallQuestions: PatientCall[];
  patientCallQuestions$: Observable<PatientCall[]>;

  ngOnInit() {
    this.createForm();
  }
  createForm() {
    this.nextQuestionsForm = this.fb.group({
      'call-question-0': this.fb.control({})
    });
  }
  highlightCallQuestion(patientCallQuestionId: number) {
    alert('highlighting ' + patientCallQuestionId);
    debugger;
  }
}
