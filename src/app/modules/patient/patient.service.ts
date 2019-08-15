import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PatientCall } from './patient-detail/patient-call/patient-call.service';
import { Operation } from '../operation/operation.service';

export interface Patient {
  patientId: number;
  patientOperationId: number;
  operation?: Operation;
  operation$: Observable<Operation>;
  medicalRecordNumber: string;
  patientFirstName: string;
  patientMiddleName: string;
  patientLastName: string;
  patientDischargeDate: Date;
  patientDob: Date;
  age: number | null;
  avatar: string;
  // We may not always have this, but it's nice to have when we do need it
  // for the sake of labeling, etc.
  patientContactNumberId?: number | null;
  patientContactNumber?: number | null;
  patientCalls?: PatientCall[];
  patientCalls$: Observable<PatientCall[]>;
  patientCallCount?: number;
  patientCurrentStatusLabel?: number;
}

export class PatientService {
  constructor(private http: HttpClient) {}

  addNewPatient(): Observable<Patient> {
    return this.http.post<Patient>('patients', {}).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  editPatientByPatientId(patientId: number, payload: Patient): Observable<Patient> {
    return this.http.put<Patient>('patients/' + patientId, payload).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientListByOperationId(operationId: number): Observable<[Patient]> {
    return this.http.get<[Patient]>('operations/' + operationId + '/patients').pipe(
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
