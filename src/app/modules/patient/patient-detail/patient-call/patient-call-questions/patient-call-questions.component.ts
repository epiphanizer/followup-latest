import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {
  PatientCall,
  PatientCallQuestionAnswer
} from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { PatientCallQuestionsService, PatientCallQuestion } from './patient-call-questions.service';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-patient-call-questions',
  templateUrl: './patient-call-questions.component.html',
  styleUrls: ['./patient-call-questions.component.scss']
})
export class PatientCallQuestionsComponent implements OnInit {
  @Input() patientCall: PatientCall;
  patientCallQuestionsAnswers: PatientCallQuestionAnswer[];
  patientCallQuestionsAnswersForm: FormGroup;
  questions: PatientCallQuestion[];
  questions$: Observable<PatientCallQuestion[]>;
  @Output() patientCallAnwersChangeEmitter = new EventEmitter<PatientCallQuestionAnswer[]>();

  constructor(private fb: FormBuilder, private patientCallQuestionsService: PatientCallQuestionsService) {}

  ngOnInit() {
    this.createForm();
    this.patientCallQuestionsService
      .getPatientCallQuestionsByPatientCallId(this.patientCall.patientCallId)
      .pipe(
        map((patientCallQuestions: PatientCallQuestion[]) => {
          this.questions = patientCallQuestions;
          patientCallQuestions.forEach((patientCallQuestion: PatientCallQuestion) => {
            /**
             * Backwards compatibility check
             */
            if (patientCallQuestion.patientQuestionTypeLabel != 'rating') {
              let formArray = this.patientCallQuestionsAnswersForm.controls.patientCallQuestionsAnswers as FormArray;
              let newFormGroup = this.fb.group({});
              let newControl = new FormControl('');
              newFormGroup.addControl(patientCallQuestion.patientCallQuestionId.toString(), newControl);
              formArray.push(newFormGroup);
            }
          });
        })
      )
      .subscribe();
    this.onChanges();
  }
  onChanges() {
    if (this.patientCallQuestionsAnswersForm) {
      this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers').valueChanges.subscribe(val => {
        this.patientCallQuestionsAnswers = val;
        this.patientCallAnwersChangeEmitter.emit(this.patientCallQuestionsAnswers);
      });
    }
  }
  createForm() {
    this.patientCallQuestionsAnswersForm = this.fb.group({
      patientCallQuestionsAnswers: this.fb.array([])
    });
  }
}
