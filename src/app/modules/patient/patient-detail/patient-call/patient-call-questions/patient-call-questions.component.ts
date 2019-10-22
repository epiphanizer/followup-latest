import { Component, OnInit, Input } from '@angular/core';
import { PatientCall } from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { PatientCallQuestionsService, PatientCallQuestion } from './patient-call-questions.service';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-patient-call-questions',
  templateUrl: './patient-call-questions.component.html',
  styleUrls: ['./patient-call-questions.component.scss']
})
export class PatientCallQuestionsComponent implements OnInit {
  @Input() patientCall: PatientCall;
  patientCallQuestionsAnswersForm: FormGroup;
  questions: PatientCallQuestion[];
  questions$: Observable<PatientCallQuestion[]>;
  constructor(private fb: FormBuilder, private patientCallQuestionsService: PatientCallQuestionsService) {}

  ngOnInit() {
    this.createForm();
    this.patientCallQuestionsService
      .getPatientCallQuestionsByPatientCallId(this.patientCall.patientCallId)
      .pipe(
        map((patientCallQuestions: PatientCallQuestion[]) => {
          this.questions = patientCallQuestions;
          patientCallQuestions.forEach((patientCallQuestion: PatientCallQuestion) => {
            let formArray = this.patientCallQuestionsAnswersForm.controls.patientCallQuestionsAnswers as FormArray;
            formArray.push(this.fb.control(''));
          });
        })
      )
      .subscribe();
  }
  createForm() {
    this.patientCallQuestionsAnswersForm = this.fb.group({
      patientCallQuestionsAnswers: this.fb.array([])
    });
  }
}
