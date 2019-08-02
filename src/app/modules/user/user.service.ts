import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Operation } from '@app/modules/operation/operation.service';
import { HttpService } from '@app/core';

export interface User {
  displayName: string;
  token: string;
  id: number;
  id$: Observable<number>;
  level: number;
  email: string;
  avatar: string;
  operations: Array<Operation> | Array<{}>;
  operations$: Observable<Array<Operation>>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpService) {}
  public getUserIdByUserEmail(email: string) {
    return this.http.get<number>('users/lookup').pipe(
      retry(1), // retry a failed request up to 2 total times
      catchError(error => this.handleAsyncError(error))
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
        'We had trouble connecting to the user API route. \
    Please contact your IT department and relay this message.'
    });
  }
}
