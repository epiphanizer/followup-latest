import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AuthenticationService, HttpService } from '@app/core';
import { share, catchError } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class UserResolver implements Resolve<User> {
  private readonly userIdleTimeoutMs = 15 * 60 * 1000;
  user: User;
  user$: Observable<User>;
  constructor(private authService: AuthenticationService, private http: HttpService) {}

  resolve(): Observable<User> {
    const currentUser = this.authService.currentUserValue || this.authService.currentUserSubject.getValue();

    if (!currentUser) {
      window.location.href = '/login';
      return of(null);
    }

    /**
     * Make sure timeout hasn't occurred;
     */
    this.user$ = of(currentUser);
    this.user = currentUser;
    var date = new Date();
    var currentTime = date.getTime();

    if (currentTime > this.user.userLoginExpires) {
      if (this.hasActiveTokenSession()) {
        this.extendUserSession(currentTime);
        return this.user$;
      }

      this.authService.signOut(this.user.userId);
      return of(null);
    }

    /**
     * If we are under 15 mins, give the user another 15.
     */
    if (this.user.userLoginExpires - currentTime < this.userIdleTimeoutMs) {
      this.extendUserSession(currentTime);
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

  private hasActiveTokenSession(): boolean {
    if (typeof this.authService.getToken !== 'function') {
      return false;
    }

    return !!this.authService.getToken();
  }

  private extendUserSession(currentTime: number) {
    this.user.userLoginExpires = currentTime + this.userIdleTimeoutMs;
    this.authService.currentUserSubject.next(this.user);
    localStorage.setItem('followup-user', JSON.stringify(this.user));
  }
}
