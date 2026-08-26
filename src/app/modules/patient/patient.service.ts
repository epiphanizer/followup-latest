import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, shareReplay, take, tap } from 'rxjs/operators';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Patient, PatientDischargeLabel } from './patient';
import { PatientPutBody } from './patient-form/patient-form';
import { UserLanguage } from '../user/user';
import { SKIP_GLOBAL_LOADER } from '@app/shared/interceptors/loader-interceptor';

interface CachedPatientRequest<T> {
  expiresAt: number;
  request$: Observable<T>;
}

@Injectable()
export class PatientService {
  private readonly activePatientCacheTtlMs = 15000;
  private readonly activePatientCache = new Map<string, CachedPatientRequest<[Patient]>>();

  constructor(private http: HttpClient) {}

  private readonly progressiveLoadOptions = {
    context: new HttpContext().set(SKIP_GLOBAL_LOADER, true)
  };

  private clearActivePatientCache(): void {
    this.activePatientCache.clear();
  }

  private getCachedActivePatientRequest(
    cacheKey: string,
    requestFactory: () => Observable<[Patient]>
  ): Observable<[Patient]> {
    const cachedRequest = this.activePatientCache.get(cacheKey);
    if (cachedRequest && cachedRequest.expiresAt > Date.now()) {
      return cachedRequest.request$;
    }

    const request$ = requestFactory().pipe(shareReplay(1));
    this.activePatientCache.set(cacheKey, {
      expiresAt: Date.now() + this.activePatientCacheTtlMs,
      request$
    });
    return request$;
  }

  addNewPatient(): Observable<Patient> {
    return this.http.post<Patient>('patients', {}).pipe(
      tap(() => this.clearActivePatientCache()),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  deactivatePatientByPatientId(patientId: string): Observable<Patient> {
    return this.http.post<Patient>('patients/' + patientId + '/deactivate', {}).pipe(
      tap(() => this.clearActivePatientCache()),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  deletePatientByPatientId(patientId: string): Observable<Patient> {
    return this.http.delete<Patient>('patients/' + patientId).pipe(
      tap(() => this.clearActivePatientCache()),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  editPatientByPatientId(patientId: string, patientPutBody: PatientPutBody): Observable<Patient> {
    return this.http.put<Patient>('patients/' + patientId, patientPutBody).pipe(
      tap(() => this.clearActivePatientCache()),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getActiveSpanishPatients(): Observable<[Patient]> {
    const cacheKey = 'spanish';

    return this.getCachedActivePatientRequest(cacheKey, () =>
      this.http.get<[Patient]>('patients/spanish', this.progressiveLoadOptions).pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => {
          this.activePatientCache.delete(cacheKey);
          return this.handleAsyncError(e);
        }) // then handle the error
      )
    );
  }
  getActivePatientListByOperationId(operationId: string): Observable<[Patient]> {
    const cacheKey = `operation:${operationId}`;

    return this.getCachedActivePatientRequest(cacheKey, () =>
      this.http.get<[Patient]>('operations/' + operationId + '/patients', this.progressiveLoadOptions).pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(e => {
          this.activePatientCache.delete(cacheKey);
          return this.handleAsyncError(e);
        }) // then handle the error
      )
    );
  }
  getPatientLanguagesByPatientId(patientId: string): Observable<[UserLanguage]> {
    return this.http.get<[UserLanguage]>('patients/' + patientId + '/languages', this.progressiveLoadOptions).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientsByOperationId(operationId: string): Observable<[Patient]> {
    return this.http.get<[Patient]>('operations/' + operationId + '/patients/all').pipe(
      take(1),
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientDischargeLabels(): Observable<PatientDischargeLabel[]> {
    return this.http.get<PatientDischargeLabel[]>('patients/discharge/labels').pipe(
      map((labels: PatientDischargeLabel[]) => {
        return (labels || []).filter((label: PatientDischargeLabel) => {
          if (typeof label.patientDischargeLabelActive === 'undefined') {
            return true;
          }
          return Number(label.patientDischargeLabelActive) === 1;
        });
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  getPatientByPatientId(patientId: string): Observable<Patient> {
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
