import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpService } from '@app/core';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface PatientCallNoteHighlights {
  firstWordOffset: number;
  lastWordOffset: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientCallNotesHighlightService {
  constructor(private http: HttpService) {}
  addPatientCallHighlightByPatientCallNoteId = function(patientCallNoteId: number) {
    return this.http.post('patients/calls/' + patientCallNoteId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallNoteHighlightsByPatientCallId = function(patientId: number) {
    return this.http.post('patients/' + patientId + '/calls').pipe(
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
