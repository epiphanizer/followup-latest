import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { PatientCallQuestion } from './patient-call-questions/patient-call-questions.service';

export interface PatientCall {
  patientCallId: number;
  patientId: number;
  patientCalledByUserId?: number;
  patientContactNumberId?: number;
  patientCallStartTime: Date;
  patientCallEndTime?: Date;
  patientCallStatusLabelId: number;
  patientCallStatusLabel?: string;
  patientCallNumber?: number;
  patientCallQuestions: PatientCallQuestion[];
  patientCallQuestions$: Observable<PatientCallQuestion[]>;
}

export interface PatientCallQuestionAnswer {
  patientCallQuestionId: number;
  patientCallQuestionAnswer: string;
}
export interface PatientCallStatusLabel {
  patientCallStatusLabelId: number;
  patientCallStatusLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientCallService {
  /**
   * A public parameter that gives a Status of a call in terms
   * of time.
   */
  public call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}
  startPatientCallByUserIdAndPatientCallId = function(userId: number, patientCallId: number) {
    return this.http
      .post('patients/calls/' + patientCallId + '/start', {
        userId: userId
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };

  getCallRepCallsByUserIdAndOperationId = function(userId: number, operationId: number) {
    return this.http.get('users/' + userId + '/calls/operation/' + operationId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallByPatientCallId = function(patientId: number, patientCallId: number) {
    return this.http.get('patients/' + patientId + '/calls/' + patientCallId).pipe(
      delay(5000),
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallsByPatientId = function(patientId: number) {
    return this.http.get('patients/' + patientId + '/calls').pipe(
      delay(5000),
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  // Updates the status to 'ended'
  public endPatientCall(patientCallId: number) {
    return this.http.post('patients/calls/' + patientCallId + '/end', {}).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  public finalizePatientCall(patientCall: PatientCall) {
    return this.http
      .post('patients/calls/' + patientCall.patientCallId + '/finalize', {
        patientCallStatusLabelId: patientCall.patientCallStatusLabelId
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  // Needs accompanying swagger
  public addNewPatientCallByPatientId(
    patientId: number,
    patientCallScheduledTime: string,
    patientCallStatusLabelId: number
  ) {
    return this.http
      .post('patients/' + patientId + '/calls', {
        patientCallScheduledTime: patientCallScheduledTime,
        patientCallStatusLabelId: patientCallStatusLabelId
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
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
