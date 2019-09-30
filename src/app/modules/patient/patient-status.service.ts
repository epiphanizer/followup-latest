import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface PatientStatus {
  patientStatusId: number;
  patientStatusLabel: string;
}

export class PatientStatusService {
  constructor(private http: HttpClient) {}

  addNewPatientStatusByPatientId(
    patientId: number,
    patientStatusLabelId: number,
    patientStatusNotes: string
  ): Observable<PatientStatus> {
    return this.http
      .post<PatientStatus>('patients/' + patientId + '/status', {
        patientStatusLabelId: patientStatusLabelId,
        patientStatusNotes: patientStatusNotes
      })
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  getPatientStatusLabels(): any {
    return this.http.get('patients/statuses').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientStatusByPatientId(patientId: number): Observable<PatientStatus> {
    return this.http.get<PatientStatus>('patients/' + patientId + '/status').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  getPatientStatusesByPatientId(patientId: number): Observable<PatientStatus[]> {
    return this.http.get<PatientStatus[]>('patients/' + patientId + '/statuses').pipe(
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
