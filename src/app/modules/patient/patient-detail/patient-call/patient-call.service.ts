import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { PatientCallQuestion } from './patient-call-questions/patient-call-questions.service';

interface CachedPatientCallRequest<T> {
  expiresAt: number;
  request$: Observable<T>;
}

export interface PatientCall {
  patientCallId: string;
  patientId: string;
  patientOperationId?: string;
  patientCalledByUserId?: string;
  patientContactNumberId?: string;
  patientCallCreatedTime: Date;
  patientCallScheduledTime?: Date;
  patientCallStartTime?: Date;
  patientCallEndTime?: Date;
  patientCallStatusLabelId: string;
  patientCallStatusLabel?: string;
  patientCallNumber?: number;
  patientCallCount?: number;
  patientCallNotes?: string;
  patientCallNotesHighlighted?: number;
  patientCallQuestions: PatientCallQuestion[];
  patientCallQuestions$: Observable<PatientCallQuestion[]>;
  // nice to have for our filter listing
  patientFirstName?: string;
  patientLastName?: string;
  finalCall?: boolean;
}

export interface PatientCallQuestionAnswer {
  patientCallQuestionId: string;
  patientCallQuestionAnswer: string;
}
export interface PatientCallStatusLabel {
  patientCallStatusLabelId: string;
  patientCallStatusLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientCallService {
  private readonly patientCallCacheTtlMs = 15000;
  private readonly patientCallRequestCache = new Map<string, CachedPatientCallRequest<unknown>>();

  /**
   * A public parameter that gives a Status of a call in terms
   * of time.
   */
  public call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}

  private clearPatientCallCache(): void {
    this.patientCallRequestCache.clear();
  }

  private getCachedPatientCallRequest<T>(cacheKey: string, requestFactory: () => Observable<T>): Observable<T> {
    const cachedRequest = this.patientCallRequestCache.get(cacheKey) as CachedPatientCallRequest<T> | undefined;
    if (cachedRequest && cachedRequest.expiresAt > Date.now()) {
      return cachedRequest.request$;
    }

    const request$ = requestFactory().pipe(shareReplay(1));
    this.patientCallRequestCache.set(cacheKey, {
      expiresAt: Date.now() + this.patientCallCacheTtlMs,
      request$
    });
    return request$;
  }

  startPatientCallByUserIdAndPatientCallId = function(userId: string, patientCallId: string) {
    return this.http
      .post('patients/calls/' + patientCallId + '/start', {
        userId: userId
      })
      .pipe(tap(() => this.clearPatientCallCache()));
  };

  getCallRepCallsByUserIdAndOperationId = function(userId: string, operationId: string) {
    return this.http.get('users/' + userId + '/calls/operation/' + operationId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallByPatientCallId = function(patientId: string, patientCallId: string) {
    return this.http.get('patients/' + patientId + '/calls/' + patientCallId).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallsByPatientId = function(patientId: string) {
    return this.http.get('patients/' + patientId + '/calls').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallsByOperationId = function(operationId: string) {
    const cacheKey = `operation:${operationId}`;

    return this.getCachedPatientCallRequest(cacheKey, () =>
      this.http.get('operations/' + operationId + '/calls').pipe(
        catchError(e => {
          this.patientCallRequestCache.delete(cacheKey);
          return this.handleAsyncError(e);
        }) // then handle the error
      )
    );
  };
  getSpanishSpeakingPatientCalls = function() {
    const cacheKey = 'spanish';

    return this.getCachedPatientCallRequest(cacheKey, () =>
      this.http.get('spanish/calls').pipe(
        catchError(e => {
          this.patientCallRequestCache.delete(cacheKey);
          return this.handleAsyncError(e);
        }) // then handle the error
      )
    );
  };

  // Updates the status to 'ended'
  public endPatientCall(patientCallId: string) {
    return this.http.post('patients/calls/' + patientCallId + '/end', {}).pipe(
      tap(() => this.clearPatientCallCache()),
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  public finalizePatientCall(patientCall: PatientCall) {
    return this.http
      .post('patients/calls/' + patientCall.patientCallId + '/finalize', {
        patientCallStatusLabelId: patientCall.patientCallStatusLabelId
      })
      .pipe(
        tap(() => this.clearPatientCallCache()),
        catchError(e => this.handleAsyncError(e))
      );
  }

  // Needs accompanying swagger
  public addNewPatientCallByPatientId(patientId: string, patientCallScheduledTime: string) {
    return this.http
      .post('patients/' + patientId + '/calls', {
        patientCallScheduledTime: patientCallScheduledTime
      })
      .pipe(
        tap(() => this.clearPatientCallCache()),
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
        <strong>Error</strong>: We had trouble within the patient call service!\
      </div>'
    );
  }
}
