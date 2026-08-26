import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, retry, shareReplay, tap, timeout } from 'rxjs/operators';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SKIP_GLOBAL_LOADER } from '@app/shared/interceptors/loader-interceptor';

export interface PatientStatus {
  patientStatusId: string;
  patientStatusLabelId: string;
  patientStatusLabel?: string;
  patientStatusLabelActive?: number | boolean;
  patientStatusNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientStatusService {
  private patientStatusLabelsCache?: PatientStatus[];
  private patientStatusLabelsRequest$?: Observable<PatientStatus[]>;

  constructor(private http: HttpClient) {}

  private readonly progressiveLoadOptions = {
    context: new HttpContext().set(SKIP_GLOBAL_LOADER, true)
  };

  addPatientStatusByPatientId(
    patientId: string,
    patientStatusLabelId: string,
    patientStatusNotes: string
  ): Observable<PatientStatus> {
    return this.http
      .post<PatientStatus>('patients/' + patientId + '/statuses', {
        patientStatusLabelId: patientStatusLabelId,
        patientStatusNotes: patientStatusNotes
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  editPatientStatusByPatientStatusId(
    patientStatusId: string,
    patientStatusLabelId: string,
    patientStatusNotes: string
  ): Observable<PatientStatus> {
    return this.http
      .post<PatientStatus>('patients/statuses/' + patientStatusId, {
        patientStatusLabelId: patientStatusLabelId,
        patientStatusNotes: patientStatusNotes
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  getPatientStatusLabels(): Observable<PatientStatus[]> {
    if (this.patientStatusLabelsCache) {
      return of(this.patientStatusLabelsCache);
    }

    if (!this.patientStatusLabelsRequest$) {
      this.patientStatusLabelsRequest$ = this.http.get<PatientStatus[]>('patients/statuses', this.progressiveLoadOptions).pipe(
        retry(3),
        timeout(15000),
        map((labels: PatientStatus[]) => {
          return (labels || []).filter((label: PatientStatus) => {
            if (typeof label.patientStatusLabelActive === 'undefined') {
              return true;
            }
            return Number(label.patientStatusLabelActive) === 1;
          });
        }),
        tap((labels: PatientStatus[] | null) => {
          this.patientStatusLabelsCache = labels || [];
        }),
        finalize(() => {
          this.patientStatusLabelsRequest$ = undefined;
        }),
        catchError(e => {
          this.patientStatusLabelsCache = undefined;
          return this.handleAsyncError(e);
        }),
        shareReplay(1)
      );
    }

    return this.patientStatusLabelsRequest$;
  }
  getPatientDischargeLabels(): any {
    return this.http.get('patients/discharge/labels').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientStatusByPatientId(patientId: string): Observable<PatientStatus> {
    return this.http.get<PatientStatus>('patients/' + patientId + '/status').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  getPatientStatusesByPatientId(patientId: string): Observable<PatientStatus[]> {
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
