import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, take } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Patient, PatientDischargeLabel } from './patient';
import { PatientPutBody } from './patient-form/patient-form';
import { UserLanguage } from '../user/user';

@Injectable()
export class PatientService {
  constructor(private http: HttpClient) {}

  addNewPatient(): Observable<Patient> {
    return this.http.post<Patient>('patients', {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  deactivatePatientByPatientId(patientId: number): Observable<Patient> {
    return this.http.post<Patient>('patients/' + patientId + '/deactivate', {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  deletePatientByPatientId(patientId: number): Observable<Patient> {
    return this.http.delete<Patient>('patients/' + patientId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  editPatientByPatientId(patientId: number, patientPutBody: PatientPutBody): Observable<Patient> {
    return this.http.put<Patient>('patients/' + patientId, patientPutBody).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getActiveSpanishPatients(): Observable<[Patient]> {
    return this.http.get<[Patient]>('patients/spanish').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getActivePatientListByOperationId(operationId: number): Observable<[Patient]> {
    return this.http.get<[Patient]>('operations/' + operationId + '/patients').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientLanguagesByPatientId(patientId: number): Observable<[UserLanguage]> {
    return this.http.get<[UserLanguage]>('patients/' + patientId + '/languages').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientsByOperationId(operationId: number): Observable<[Patient]> {
    return this.http.get<[Patient]>('operations/' + operationId + '/patients/all').pipe(
      take(1),
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientDischargeLabels(): Observable<PatientDischargeLabel[]> {
    return this.http.get<PatientDischargeLabel[]>('patients/discharge/labels').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
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
