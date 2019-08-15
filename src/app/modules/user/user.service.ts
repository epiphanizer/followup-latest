import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Operation } from '@app/modules/operation/operation.service';
import { PatientCall } from '../patient/patient-detail/patient-call/patient-call.service';

export interface User {
  displayName: string;
  userFirstName?: string;
  userMiddleName?: string;
  userLastName?: string;
  userPhoneCountryCode?: number;
  userPhoneAreaCode?: number;
  userPhoneNumber?: number;
  userDob?: Date;
  token: string;
  id: number;
  id$: Observable<number>;
  level: number;
  email: string;
  avatar: string;
  operations: Array<Operation>;
  operations$: Observable<Array<Operation>>;
  patientCalls: Array<PatientCall>;
  patientCalls$: Observable<PatientCall[]>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  deactivateUserByUserId(userId: number) {
    this.http.delete('user/' + userId).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(e => this.handleAsyncError(e)) // then handle the error
    );
  }
  updateUserByUserId(userId: number, formData: FormData) {
    this.http.put('user/' + userId, formData).pipe(
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
