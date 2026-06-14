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
  styleUrls: ['./patient-call-questions.component.scss'],
  standalone: false
})
export class PatientCallQuestionsComponent implements OnInit {
  @Input() patientCall: PatientCall;
  @Input() lastCall?: PatientCall;
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
      .subscribe((patientCallQuestions: PatientCallQuestion[]) => {
        this.questions = patientCallQuestions;
        // Create form controls for each patient call question
        patientCallQuestions.forEach((patientCallQuestion: PatientCallQuestion) => {
          this.addQuestionControl(patientCallQuestion);
        });

        // Only if lastCall exists, proceed with fetching lastCall-related data
        if (this.lastCall) {
          this.handleLastCall();
        }
      });

    this.onChanges();
  }

  handleLastCall() {
    this.patientCallQuestionsService
      .getPatientCallQuestionsWithAnswersByPatientCallId(this.lastCall.patientCallId)
      .subscribe((lastCallQuestions: PatientCallQuestion[]) => {
        const sanitizedAnswers = lastCallQuestions
          .slice(3, 8)
          .map((question: PatientCallQuestion) =>
            question.patientCallQuestionAnswer !== null &&
            question.patientCallQuestionAnswer !== undefined &&
            question.patientCallQuestionAnswer !== ''
              ? question.patientCallQuestionAnswer
              : 0
          );

        this.setAnswerForQuestions(sanitizedAnswers, 3);
      });
  }

  setAnswerForQuestions(answers: any[], startingIndex: number) {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;
    // Loop through each question starting from the specified index
    this.questions.forEach((question, index) => {
      if (index >= startingIndex && question.patientQuestionTypeLabel === 'rating') {
        let validRating = answers[index - startingIndex];
        // Ensure validRating is a number, fallback to 0 if null or undefined
        validRating = validRating !== null && validRating !== undefined ? parseInt(validRating, 10) : 0;

        const control = formArray.at(index).get(question.patientCallQuestionId.toString());

        if (control) {
          control.setValue(validRating);
        } else {
          console.error(`Control not found for questionId: ${question.patientCallQuestionId}`);
        }
      }
    });
  }

  addQuestionControl(patientCallQuestion: PatientCallQuestion) {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;
    const questionControlId = patientCallQuestion.patientCallQuestionId.toString();
    const newFormGroup = this.fb.group({});

    // Add the control with an initial value based on the type
    if (patientCallQuestion.patientCallQuestionType === 'rating') {
      newFormGroup.addControl(questionControlId, new FormControl(0)); // default rating value
    } else {
      newFormGroup.addControl(questionControlId, new FormControl('')); // default empty value for other types
    }

    formArray.push(newFormGroup);
  }

  private getQuestionControl(questionIndex: number, questionId: string): FormControl | null {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;
    return (formArray.at(questionIndex)?.get(questionId.toString()) as FormControl) || null;
  }

  isBooleanAnswer(questionIndex: number, questionId: string, expectedValue: string): boolean {
    return this.getQuestionControl(questionIndex, questionId)?.value === expectedValue;
  }

  onBooleanAnswerChange(questionIndex: number, questionId: string, answerValue: string, checked: boolean) {
    const control = this.getQuestionControl(questionIndex, questionId);

    if (!control) {
      return;
    }

    if (checked) {
      control.setValue(answerValue);
      return;
    }

    if (control.value === answerValue) {
      control.setValue('');
    }
  }

  setRating(questionId: string, rating: number) {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;

    // Ensure that the rating is treated as an integer
    const numericRating = parseInt(rating.toString(), 10);

    // Find the index of the question in the questions array
    const index = this.questions.findIndex(question => question.patientCallQuestionId === questionId);

    if (index !== -1) {
      const control = formArray.at(index).get(questionId);

      if (control) {
        control.setValue(numericRating);
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
      this.patientCallQuestionsAnswersForm
        .get('patientCallQuestionsAnswers')
        .valueChanges.pipe(
          map((val: any[]) => {
            // Replace null or undefined values with empty string or default value
            return val.map(v => (v === null || v === undefined ? '' : v));
          })
        )
        .subscribe(val => {
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
