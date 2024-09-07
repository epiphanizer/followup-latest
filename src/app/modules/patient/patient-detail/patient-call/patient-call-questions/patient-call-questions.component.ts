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

        const answerObservables = lastCallQuestions.map((question: PatientCallQuestion) =>
          this.patientCallQuestionsService
            .getPatientCallQuestionAnswersByPatientCallQuestionId(question.patientCallQuestionId)
            .pipe(
              map((patientCallQuestionAnswers: PatientCallQuestionAnswer[] | null) => {
                // Ensure patientCallQuestionAnswers is not null or undefined before accessing its length
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
          this.setAnswerForQuestions(answersArray);
        });
      });
    }

    this.onChanges();
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
  setAnswerForQuestions(answers: any[]) {
    const formArray = this.patientCallQuestionsAnswersForm.get('patientCallQuestionsAnswers') as FormArray;

    // Loop through each question
    this.questions.forEach((question, index) => {
      // Only focus on rating questions
      if (question.patientCallQuestionType === 'rating') {
        let validRating = null;

        // Check for valid ratings from the answer list
        for (let i = answers.length - 1; i >= 0; i--) {
          // If it's a number, consider it a valid rating
          if (typeof answers[i] === 'number') {
            validRating = answers[i];
            break;
          }
        }

        // If we found a valid rating, set it for the current question
        if (validRating !== null) {
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
