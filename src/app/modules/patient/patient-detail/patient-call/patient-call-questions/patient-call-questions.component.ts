import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {
  PatientCall,
  PatientCallQuestionAnswer
} from '@app/modules/patient/patient-detail/patient-call/patient-call.service';
import { Observable } from 'rxjs';
import { PatientCallQuestionsService, PatientCallQuestion } from './patient-call-questions.service';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

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

    // Ensure lastCall is present before trying to forkJoin
    if (this.lastCall) {
      // Fetch patientCallQuestions and lastCallQuestions in parallel
      forkJoin({
        patientCallQuestions: this.patientCallQuestionsService.getPatientCallQuestionsByPatientCallId(
          this.patientCall.patientCallId
        ) as Observable<PatientCallQuestion[]>,
        lastCallQuestions: this.patientCallQuestionsService.getPatientCallQuestionsByPatientCallId(
          this.lastCall.patientCallId
        ) as Observable<PatientCallQuestion[]>
      }).subscribe(({ patientCallQuestions, lastCallQuestions }) => {
        // Now both patientCallQuestions and lastCallQuestions are available

        // Assign the questions from the current call
        this.questions = patientCallQuestions;

        // Create form controls for each patient call question
        patientCallQuestions.forEach((patientCallQuestion: PatientCallQuestion) => {
          this.addQuestionControl(patientCallQuestion);
        });

        // Fetch answers for lastCall questions
        const answerObservables = lastCallQuestions.slice(3, 8).map((question: PatientCallQuestion, index: number) =>
          this.patientCallQuestionsService
            .getPatientCallQuestionAnswersByPatientCallQuestionId(question.patientCallQuestionId)
            .pipe(
              map((patientCallQuestionAnswers: PatientCallQuestionAnswer[] | null) => {
                // Ensure patientCallQuestionAnswers is not null or undefined before accessing length
                if (patientCallQuestionAnswers && patientCallQuestionAnswers.length > 0) {
                  return patientCallQuestionAnswers[0].patientCallQuestionAnswer;
                } else {
                  return null; // If no answers exist, return null
                }
              })
            )
        );

        // Wait for all answers to be retrieved before processing
        forkJoin(answerObservables).subscribe((answersArray: any[]) => {
          // Map the answers to the new patient call questions (starting from index 3)
          this.setAnswerForQuestions(answersArray, 3);
        });
      });
    }

    this.onChanges();
  }

  setAnswerForQuestions(answers: any[], startingIndex: number) {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;
    // Loop through each question starting from the specified index
    this.questions.forEach((question, index) => {
      if (index >= startingIndex && question.patientQuestionTypeLabel === 'rating') {
        let validRating = answers[index - startingIndex];
        if (validRating !== null) {
          validRating = parseInt(validRating, 10);

          const control = formArray.at(index).get(question.patientCallQuestionId.toString());

          if (control) {
            control.setValue(validRating);
          } else {
            console.error(`Control not found for questionId: ${question.patientCallQuestionId}`);
          }
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
            // Replace any undefined values with an empty string
            return val.map(v => (v === undefined ? '' : v));
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
