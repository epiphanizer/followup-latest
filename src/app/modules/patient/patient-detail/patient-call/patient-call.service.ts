import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export interface PatientCall {
  patientCallId: number;
  patientId: number;
  patientCalledByUserId: number;
  patientContactNumberId: number;
  patientCallStartTime: Date;
  patientCallEndTime?: Date;
  patientCallStatusLabelId: number;
  patientCallNumber?: number;
}

// export interface PatientCallQuestionAnswer {
//   patientCallQuestionAnswerId: number;
//   patientCallQuestionAnswer: string;
// }

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
  addPatientCallByUserIdAndPatientId = function(userId: number, patientId: number, patientContactNumberId: number) {
    return this.http
      .post('patients/' + patientId + '/calls', { userId: userId, patientContactNumberId: patientContactNumberId })
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

  getPatientCallsByPatientId = function(patientId: number) {
    return this.http.post('patients/' + patientId + '/calls').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  /**
   * This hook is a bit misleading, it's actually the termination call in the frontend,
   * but for our purposes, we are really just "putting" to edit the call termination time.
   */
  public endPatientCall(patientCallId: number) {
    return this.http.put('patients/calls/' + patientCallId, {}).pipe(
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
