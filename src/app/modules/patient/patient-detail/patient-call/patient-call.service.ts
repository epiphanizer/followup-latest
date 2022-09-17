import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { PatientCallQuestion } from './patient-call-questions/patient-call-questions.service';

export interface PatientCall {
  patientCallId: string;
  patientId: string;
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
  /**
   * A public parameter that gives a Status of a call in terms
   * of time.
   */
  public call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}
  startPatientCallByUserIdAndPatientCallId = function(userId: string, patientCallId: string) {
    return this.http
      .post('patients/calls/' + patientCallId + '/start', {
        userId: userId
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
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
    return this.http.get('operations/' + operationId + '/calls').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  getSpanishSpeakingPatientCalls = function() {
    return this.http.get('spanish/calls').pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  // Updates the status to 'ended'
  public endPatientCall(patientCallId: string) {
    return this.http.post('patients/calls/' + patientCallId + '/end', {}).pipe(
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }

  public finalizePatientCall(patientCall: PatientCall) {
    return this.http
      .post('patients/calls/' + patientCall.patientCallId + '/finalize', {
        patientCallStatusLabelId: patientCall.patientCallStatusLabelId
      })
      .pipe(catchError(e => this.handleAsyncError(e)));
  }

  // Needs accompanying swagger
  public addNewPatientCallByPatientId(patientId: string, patientCallScheduledTime: string) {
    return this.http
      .post('patients/' + patientId + '/calls', {
        patientCallScheduledTime: patientCallScheduledTime
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  private handleAsyncError(error: HttpErrorResponse) {
    if (error.status == 400) {
      console.log(error);
      alert('It looks like this call has already finished!');
    }
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
