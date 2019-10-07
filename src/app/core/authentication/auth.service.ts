import { Injectable } from '@angular/core';
import { OAuthSettings } from '@app/oauth';
import { AlertsService } from '@app/core/alerts/alerts.service';
import { Subscription, Observable, throwError, of } from 'rxjs';
import { map, delay, share, catchError, retry } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { Operation, OperationService } from '@app/modules/operation/operation.service';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EmailValidator } from '@angular/forms';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public authenticated: boolean;
  public user: User;
  public user$: Promise<User>;
  constructor(private http: HttpService, private router: Router) {
    if (!this.authenticated) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
  ngOnInit() {}

  async getUser(): Promise<User> {
    let userId = 10;
    this.user$ = this.getUserByUserId(userId).toPromise();
    return this.user$;
  }
  getUserByUserId(userId: number): Observable<User> {
    return this.http.get<User>('users/' + userId).pipe(
      delay(500),
      retry(2),
      share(),
      catchError(error => this.handleAsyncError(error))
    );
  }
  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    // let result = await this.msalService.loginPopup(OAuthSettings.scopes).catch(reason => {
    //   this.alertsService.add('Login failed', JSON.stringify(reason, null, 2));
    // });
    let result = true;
    if (result) {
      this.authenticated = true;
      // this.user = await this.getUser();
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }
  // Sign out
  signOut(): void {
    // this.msalService.logout();
    this.user = null;
    this.authenticated = false;
  }

  ngOnDestroy() {}

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
