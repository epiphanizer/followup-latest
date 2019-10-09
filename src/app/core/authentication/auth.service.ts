import { Injectable } from '@angular/core';
import { AlertsService } from '@app/core/alerts/alerts.service';
import { Subscription, Observable, throwError, of } from 'rxjs';
import { map, delay, share, catchError, retry } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';
import { KicktechAuthService } from '@app/shared/kicktech-auth.service';

export interface AuthenticationBodyPost {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public authenticated: boolean;
  protected userId: number;
  public user: User;
  public user$: Promise<User>;
  constructor(private http: HttpService, private router: Router) {
    if (this.authenticated) {
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }
  ngOnInit() {}

  doLogin(username: string, password: string): Observable<number | boolean> {
    // yet with some bypassing parameter provided
    // do some encryption on what we post over within the authntication body post
    return this.http
      .post('users/login', {
        username: username,
        password: password
      })
      .pipe(
        map((res: any) => {
          console.log(res);
          if (res == null) {
            this.authenticated = false;
            return false;
          }

          this.userId = res.userId;
          debugger;
          return true;
        }),
        retry(3), // retry a failed request up to 3 times
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  getUser(): Promise<User> {
    if (!this.authenticated) return null;

    this.user$ = this.getUserByUserId(this.user.userId).toPromise();
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
  async signIn(username: string, password: string): Promise<boolean> {
    let result = await this.doLogin(username, password).toPromise();
    if (result) {
      this.authenticated = true;
      return true;
    } else {
      return false;
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
