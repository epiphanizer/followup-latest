import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { PatientCallQuestion } from '../patient-call-questions/patient-call-questions.service';
import { PatientCallQuestionAnswer } from '../patient-call.service';

@Component({
  selector: 'app-patient-next-call-questions',
  templateUrl: './patient-next-call-questions.component.html',
  styleUrls: ['./patient-next-call-questions.component.scss']
})
export class PatientNextCallQuestionsComponent implements OnInit {
  @Output() patientAnswersEmitter = new EventEmitter<PatientCallQuestionAnswer[]>();
  patientNextCallQuestionsForm: FormGroup;
  constructor(private fb: FormBuilder) {}
  patientCallQuestions: PatientCallQuestion[] = [];
  patientCallQuestions$: Observable<PatientCallQuestion[]>;

  ngOnInit() {
    this.createForm();
    this.addNextCallQuestion();
  }
  createForm() {
    this.patientNextCallQuestionsForm = this.fb.group({
      patientCallQuestions: this.fb.array([])
    });
  }
  addNextCallQuestion() {
    let nextCallQuestions = this.patientNextCallQuestionsForm.controls.patientCallQuestions as FormArray;
    nextCallQuestions.push(this.fb.control(''));
    // nextCallQuestions.push(this.fb.control(''));
    this.patientCallQuestions.push(<PatientCallQuestion>{
      patientCallQuestion: 'What is your next question?'
    });
    /**
     * Now push it to the formcontrol array
     */
  }
  togglePatientCallQuestionHighlight(patientCallQuestionId: number) {
    if (this.patientCallQuestions[patientCallQuestionId].patientCallQuestionIsHighlighted == false) {
      this.patientCallQuestions[patientCallQuestionId].patientCallQuestionIsHighlighted = true;
    } else {
      this.patientCallQuestions[patientCallQuestionId].patientCallQuestionIsHighlighted = false;
    }
  }
}
