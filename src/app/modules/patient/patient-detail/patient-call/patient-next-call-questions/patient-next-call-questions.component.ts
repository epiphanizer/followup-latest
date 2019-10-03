import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PatientCallService, PatientCall } from '../patient-call.service';
import { Observable } from 'rxjs';
import { PatientCallQuestion } from '../patient-call-questions/patient-call-questions.service';

@Component({
  selector: 'app-patient-next-call-questions',
  templateUrl: './patient-next-call-questions.component.html',
  styleUrls: ['./patient-next-call-questions.component.scss']
})
export class PatientNextCallQuestionsComponent implements OnInit {
  patientNextCallQuestionsForm: FormGroup;
  constructor(private fb: FormBuilder) {}
  patientCallQuestions: PatientCallQuestion[] = [];
  patientCallQuestions$: Observable<PatientCallQuestion[]>;

  ngOnInit() {
    this.patientCallQuestions.push(<PatientCallQuestion>{
      patientCallQuestion: 'What is your next question?'
    });
    this.createForm();
  }
  createForm() {
    this.patientNextCallQuestionsForm = this.fb.group({
      patientCallQuestions: this.fb.group({})
    });
  }
  addNextCallQuestion() {
    this.patientCallQuestions.push(<PatientCallQuestion>{
      patientCallQuestion: 'What is your next question?'
    });
  }
  highlightPatientCallQuestion(patientCallQuestionId: number) {
    debugger;
    this.patientCallQuestions[patientCallQuestionId].patientCallQuestionHighlight = true;
  }
}
