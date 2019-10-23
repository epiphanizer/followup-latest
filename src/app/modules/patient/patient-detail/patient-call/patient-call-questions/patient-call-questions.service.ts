import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { PatientCallQuestionAnswer } from '../patient-call.service';

export interface PatientCallQuestion {
  // We don't necessarily have the
  // patientCallQuestionId?
  // when we create them for the new call
  patientCallQuestionId?: number;
  patientCallQuestion: string;
  patientCallQuestionType: string;
  patientCallQuestionIsHighlighted?: boolean;
  patientCallQuestionAnswer$: Observable<PatientCallQuestionAnswer>;
}
@Injectable({
  providedIn: 'root'
})
export class PatientCallQuestionsService {
  constructor(private http: HttpService) {}

  /**
   * Patient Call Questions
   */
  addPatientCallQuestionByPatientCallId = function(patientCallId: number, patientCallQuestion: string) {
    return this.http.post('patients/calls/' + patientCallId + '/questions', { patientCallQuestion }).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallQuestionsByPatientCallId = function(patientCallId: number) {
    return this.http.get('patients/calls/' + patientCallId + '/questions').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallQuestionAnswersByPatientCallQuestionId = function(patientCallQuestionId: number) {
    return this.http.get('patients/calls/questions/' + patientCallQuestionId + '/answers').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  addPatientCallQuestionAnswersByPatientCallQuestionId = function(
    patientCallQuestionId: number,
    patientCallQuestionAnswer: string
  ) {
    debugger;
    return this.http
      .post('patients/calls/questions/' + patientCallQuestionId + '/answers', { patientCallQuestionAnswer })
      .pipe(
        retry(3), // retry a failed request up to 3 times
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
