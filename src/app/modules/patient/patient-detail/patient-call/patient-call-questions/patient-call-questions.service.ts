import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { PatientCallQuestionAnswer } from '../patient-call.service';

export interface PatientCallQuestion {
  patientCallQuestionId?: string;
  patientCallQuestion: string;
  patientCallQuestionType: string;
  patientCallQuestionOrder: number;
  patientCallQuestionIsHighlighted: number;
  patientCallQuestionAnswer?: PatientCallQuestionAnswer;
  patientCallQuestionAnswer$?: Observable<PatientCallQuestionAnswer>;
  patientQuestionTypeLabel?: string;
}
@Injectable({
  providedIn: 'root'
})
export class PatientCallQuestionsService {
  constructor(private http: HttpService) {}

  getPatientCallQuestionsByPatientCallId = function(patientCallId: string) {
    return this.http.get('patients/calls/' + patientCallId + '/questions').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallQuestionAnswersByPatientCallQuestionId = function(patientCallQuestionId: string) {
    return this.http.get('patients/calls/questions/' + patientCallQuestionId + '/answers').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  addPatientCallQuestionAnswersByPatientCallQuestionId = function(
    patientCallQuestionId: string,
    patientCallQuestionAnswer: string
  ) {
    return this.http
      .post('patients/calls/questions/' + patientCallQuestionId + '/answers', {
        patientCallQuestionAnswer: patientCallQuestionAnswer
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };

  private handleAsyncError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      '<div class="alert alert-danger" role="alert"> \
        <strong>Error</strong>: We had trouble connecting to the patient service\
      </div>'
    );
  }
}
