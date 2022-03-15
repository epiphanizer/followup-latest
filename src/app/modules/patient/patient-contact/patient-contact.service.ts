import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry, delay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { PatientContactPostBody, PatientContactPutBody } from './patient-contact';

@Injectable({
  providedIn: 'root'
})
export class PatientContactService {
  /**
   * A public parameter that gives a Status of a call in terms
   * of time.
   */
  public call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}

  getPatientContactsByPatientId = function(patientId: string) {
    return this.http.get('patients/' + patientId + '/contacts/').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  addNewPatientContactByPatientId(patientId: string, patientContactPost: PatientContactPostBody) {
    return this.http.post('patients/' + patientId + '/contacts', patientContactPost).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  editPatientContactByPatientId(patientContactId: string, patientContactPut: PatientContactPutBody) {
    return this.http.put('patients/contacts/' + patientContactId, patientContactPut).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  removePatientContactByPatientContactId(patientContactId: string) {
    return this.http.delete('patients/contacts/' + patientContactId).pipe(
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
