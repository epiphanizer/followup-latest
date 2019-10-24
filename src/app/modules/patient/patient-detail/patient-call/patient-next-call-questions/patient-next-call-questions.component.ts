import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { PatientCallQuestion } from '../patient-call-questions/patient-call-questions.service';

@Component({
  selector: 'app-patient-next-call-questions',
  templateUrl: './patient-next-call-questions.component.html',
  styleUrls: ['./patient-next-call-questions.component.scss']
})
export class PatientNextCallQuestionsComponent implements OnInit {
  @Output() patientNextCallQuestionsEmitter = new EventEmitter<PatientCallQuestion[]>();
  patientNextCallQuestionsForm: FormGroup;
  constructor(private fb: FormBuilder) {}
  patientCallQuestions: PatientCallQuestion[] = [];
  patientCallQuestions$: Observable<PatientCallQuestion[]>;
  patientNextCallQuestions: PatientCallQuestion[] = [];
  ngOnInit() {
    this.createForm();
    this.addNextCallQuestion();
    this.onChanges();
  }
  createForm() {
    this.patientNextCallQuestionsForm = this.fb.group({
      patientCallQuestions: this.fb.array([])
    });
  }
  addNextCallQuestion() {
    let nextCallQuestions = this.patientNextCallQuestionsForm.controls.patientCallQuestions as FormArray;
    nextCallQuestions.push(this.fb.control(''));
    this.patientCallQuestions.push(<PatientCallQuestion>{
      patientCallQuestion: 'What is your next question?'
    });
    /**
     * Now push it to the formcontrol array
     */
  }
  onChanges() {
    if (this.patientNextCallQuestionsForm) {
      this.patientNextCallQuestionsForm.get('patientCallQuestions').valueChanges.subscribe(val => {
        this.patientNextCallQuestions = [];
        val.forEach((val: any, index: number) => {
          let patientNextCallQuestion = {
            patientCallQuestion: val,
            patientCallQuestionIsHighlighted: 1,
            patientCallQuestionType: 'textarea',
            patientCallQuestionOrder: index
          };
          this.patientNextCallQuestions.push(patientNextCallQuestion);
        });

        this.patientNextCallQuestionsEmitter.emit(this.patientNextCallQuestions);
      });
    }
  }
  togglePatientCallQuestionHighlight(patientCallQuestionId: number) {
    if (this.patientCallQuestions[patientCallQuestionId].patientCallQuestionIsHighlighted != 1) {
      this.patientCallQuestions[patientCallQuestionId].patientCallQuestionIsHighlighted = 1;
    } else {
      this.patientCallQuestions[patientCallQuestionId].patientCallQuestionIsHighlighted = 0;
    }
  }
}
