import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface Patient {
  id: number;
  operationId: number;
  medicalRecordNumber: string;
  patientFirstName: string;
  patientLastName: string;
  patientAdmitDate: Date;
  patientDob: Date;
  avatar: string;
  /**
   * Add from stored procedure here.
   */
}

export class PatientService {
  constructor(private http: HttpClient) {}

  public getPatientListByOperationId(operationId: number): Observable<[Patient]> {
    return this.http.get<[Patient]>('operations/' + operationId + '/patients').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  /**
   *
   * We need some security here to prevent unauthorized access;
   * @param patientId
   */
  getPatientByPatientId(patientId: number): Observable<Patient> {
    return this.http.get<Patient>('patients/' + patientId).pipe(
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
