import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientIntakeQuestionService {
  constructor(private http: HttpService) {}

  addPatientIntakeQuestionAnswerByPatientIntakeQuestionId = function(
    patientIntakeQuestionId: string,
    patientIntakeQuestionAnswer: string
  ) {
    return this.http
      .post('patients/questions/' + patientIntakeQuestionId + '/answers', {
        patientIntakeQuestionAnswer: patientIntakeQuestionAnswer
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };

  editPatientIntakeQuestionAnswerByPatientIntakeQuestionId = function(
    patientIntakeQuestionId: string,
    patientIntakeQuestionAnswer: string
  ) {
    return this.http
      .put('patients/questions/' + patientIntakeQuestionId + '/answers', {
        patientIntakeQuestionAnswer: patientIntakeQuestionAnswer
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };
  getPatientIntakeQuestionsByPatientId = function(patientId: string) {
    return this.http.get('patients/' + patientId + '/questions').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientIntakeQuestionAnswersByPatientIntakeQuestionId = function(patientIntakeQuestionId: string) {
    return this.http.get('patients/questions/' + patientIntakeQuestionId + '/answers').pipe(
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
