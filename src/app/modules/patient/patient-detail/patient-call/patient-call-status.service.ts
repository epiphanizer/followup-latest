import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export interface PatientCallStatus {
  patientCallStatusLabelId: number;
  patientCallStatusLabel: string;
}
export enum PatientCallStatuses {
  '2PEXyKgz' = 1,
  'xmKxrNOy' = 2,
  'XAE2oKVR' = 3,
  '0oKZpNZw' = 4,
  '1WjBGN7G' = 5,
  'GPNVnNA3' = 6,
  'meEvwKLW' = 7
}

@Injectable({
  providedIn: 'root'
})
export class PatientCallStatusService {
  /**
   * A public parameter that gives a Status of a call in terms
   * of time.
   */
  public call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}
  addPatientCallStatusByPatientCallId = function(
    patientId: number,
    patientCallId: number,
    patientCallStatusLabelId: number
  ) {
    return this.http
      .post('patients/' + patientId + '/calls/' + patientCallId + '/statuses', {
        // userId: userId,
        patientCallStatusLabelId: patientCallStatusLabelId
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  };

  getPatientCallStatuses = function() {
    return this.http.get('patients/calls/statuses').pipe(
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
