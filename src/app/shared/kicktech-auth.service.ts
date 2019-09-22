import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/modules/user/user.service';

export interface AuthenticationBodyPost {
  userName: string;
  userPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class KicktechAuthService {
  constructor(private http: HttpClient) {}

  doLogin(userName: string, userPassword: string): Observable<AuthenticationBodyPost> {
    // yet with some bypassing parameter provided
    // do some encryption on what we post over within the authntication body post
    return this.http
      .post<AuthenticationBodyPost>('https://api.followup.care/api/v1.0/userlogin', {
        username: userName,
        password: userPassword
      })
      .pipe(
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
    return throwError({
      message:
        'We had trouble within the Auth route. \
          Please contact your IT department and relay this message.'
    });
  }
}
