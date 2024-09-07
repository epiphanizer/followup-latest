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
  @Input() lastCall: PatientCall;
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
          this.questions.forEach((patientCallQuestion: PatientCallQuestion) => {
            this.addQuestionControl(patientCallQuestion);
          });
        })
      )
      .subscribe();
    this.onChanges();
  }
  addQuestionControl(patientCallQuestion: PatientCallQuestion) {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;
    const questionControlId = patientCallQuestion.patientCallQuestionId.toString();
    const newFormGroup = this.fb.group({});

    // Add the control first
    if (patientCallQuestion.patientCallQuestionType === 'rating') {
      newFormGroup.addControl(questionControlId, new FormControl(0));
    } else {
      newFormGroup.addControl(questionControlId, new FormControl(''));
    }
    formArray.push(newFormGroup);

    // Then, asynchronously populate the control with previous answers if available
    if (this.lastCall) {
      this.patientCallQuestionsService
        .getPatientCallQuestionAnswersByPatientCallQuestionId(patientCallQuestion.patientCallQuestionId)
        .pipe(
          map((patientCallQuestionAnswer: PatientCallQuestionAnswer[]) => {
            // Check if patientCallQuestionAnswer is not null or undefined
            const lastAnswer =
              patientCallQuestionAnswer && patientCallQuestionAnswer.length > 0 ? patientCallQuestionAnswer[0] : null;

            // Safely handle the last answer
            newFormGroup.get(questionControlId)?.setValue(lastAnswer ? lastAnswer.patientCallQuestionAnswer : '');
          })
        )
        .subscribe();
    }
  }

  setRating(questionId: string, rating: number) {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;

    // Find the index of the question in the questions array
    const index = this.questions.findIndex(question => question.patientCallQuestionId === questionId);

    if (index !== -1) {
      const control = formArray.at(index).get(questionId);

      if (control) {
        control.setValue(rating);
      } else {
        console.error('Control not found for questionId:', questionId);
      }
    } else {
      console.error('Question not found for questionId:', questionId);
    }
  }
  isStarFilled(star: number, questionId: string): boolean {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;
    const index = this.questions.findIndex(question => question.patientCallQuestionId === questionId);

    if (index !== -1 && formArray && formArray.at(index)) {
      const control = formArray.at(index).get(questionId.toString());
      if (control) {
        return control.value >= star;
      }
    }
    return false;
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
