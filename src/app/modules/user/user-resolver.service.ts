import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AuthenticationService, HttpService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { share, catchError } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Observable<User>;
  constructor(
    private authService: AuthenticationService,
    private http: HttpService,
    private operationService: OperationService
  ) {}
  resolve(): Observable<User> {
    if (!this.authService.currentUserValue) {
      window.location.href = '/login';
    }
    this.user$ = of(this.authService.currentUserValue);
    this.user = this.authService.currentUserValue;
    console.log(this.user);
    /** Fetch all operations if user is admin, otherwise, get user ops. */
    if (this.user.userLevel != 1) {
      this.user.operations$ = this.operationService.getOperationsByUserId(this.user.userId);
    } else {
      this.user.operations$ = this.operationService.getAllOperations();
    }
    return this.user$;
  }

  getUserByUserId(userId: number): Observable<User> {
    return this.http.get<User>('users/' + userId).pipe(
      share(),
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
      message: 'We had trouble within the authentication service.'
    });
  }
}
