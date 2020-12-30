import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AuthenticationService, HttpService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { share, catchError } from 'rxjs/operators';
import { User, UserLanguage } from '@app/modules/user/user';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Operation } from '../operation/operation';
import { UserService } from './user.service';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Observable<User>;
  constructor(
    private authService: AuthenticationService,
    private http: HttpService,
    private operationService: OperationService,
    private userService: UserService
  ) {}
  resolve(): Observable<User> {
    if (!this.authService.currentUserValue) {
      window.location.href = '/login';
    }
    /**
     * Make sure timeout hasn't occurred;
     */
    this.user$ = of(this.authService.currentUserValue);
    this.user = this.authService.currentUserSubject.getValue();

    var self = this;
    function getUserLanguages() {
      var userLanguages$: Observable<UserLanguage[]>;
      userLanguages$ = self.userService.getUserLanguagesByUserId(self.user.userId);
      return userLanguages$;
    }
    function getUserOperations() {
      var userOperations$: Observable<Operation[]>;
      /** Fetch all operations if user is admin, otherwise, get user ops. */
      if (self.user.userLevel != 1) {
        userOperations$ = self.operationService.getOperationsByUserId(self.user.userId);
      } else {
        userOperations$ = self.operationService.getAllOperations();
      }
      return userOperations$;
    }

    var date = new Date();
    var currentTime = date.getTime();
    if (currentTime > this.user.userLoginExpires) {
      alert('You have been timed out due to inactivity');
      this.authService.signOut();
      return;
    }
    /**
     * If we are under 15 mins, give the user another 15.
     */
    if (this.user.userLoginExpires - currentTime < 900000) {
      this.user.userLoginExpires = currentTime + 900000;
      this.authService.currentUserSubject.next(this.user);
      this.user.operations$ = null;
      this.user.userLanguages$ = null;
      this.user.operations = null;
      this.user.userLanguages = null;
      localStorage.removeItem('followup-user');
      localStorage.setItem('followup-user', JSON.stringify(this.user));
      this.user.operations$ = getUserOperations();
      this.user.userLanguages$ = getUserLanguages();
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
