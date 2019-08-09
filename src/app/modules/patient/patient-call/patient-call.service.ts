import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';

export interface PatientCall {
  patientCallId: number;
  patientCallStatusId: number;
  // We won't always order this, but when we do,
  // it's nice to know which count the PatientCall is in a series for
  // the sake of labeling.
  patientCallNumber?: number;
}

export interface PatientCallQuestion {
  patientCallQuestionId: number;
  patientCallQuestion: string;
  patientCallQuestionType: string;
  patientCallQuestionHighlight: boolean;
}

export interface PatientCallQuestionAnswer {
  patientCallQuestionAnswerId: number;
  patientCallQuestionAnswer: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientCallService {
  call: {
    status: number | string;
  };
  constructor(private http: HttpService) {}
  addPatientCallByPatientId = function(patientId: number) {
    return this.http.post('patients/' + patientId + '/calls').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  getPatientCallsByPatientId = function(patientId: number) {
    return this.http.post('patients/' + patientId + '/calls').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
  /**
   * Patient Call Questions
   */
  addPatientCallQuestionByPatientCallId = function(patientCallId: number) {
    return this.http.post('patients/calls/' + patientCallId + '/questions').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };

  getPatientCallQuestionsByPatientCallId = function(patientCallId: number) {
    return this.http.post('patients/calls/' + patientCallId + '/questions').pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  };
}
