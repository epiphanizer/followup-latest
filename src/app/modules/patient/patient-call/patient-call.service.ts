import { Injectable } from '@angular/core';
import { HttpService } from '@app/core';
import { catchError, retry } from 'rxjs/operators';

export interface PatientCall {
  patientCallId: number;
  patientCallStatusId: number;
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
}
