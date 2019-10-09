import { Injectable } from '@angular/core';
import { Subscription, Observable, throwError, of } from 'rxjs';
import { map, delay, share, catchError, retry, startWith } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';

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
  public user$: Promise<User>;
  constructor(private http: HttpService, private router: Router) {}
  ngOnInit() {}

  doLogin(username: string, password: string): Observable<any> {
    // yet with some bypassing parameter provided
    return this.http
      .post('users/login', {
        username: username,
        password: password
      })
      .pipe(
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }
  public getUser(): Promise<User> {
    if (!this.authenticated) {
      alert('sorry, not authenticated');
      this.router.navigate['/login'];
      return null;
    }
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
  async signIn(username: string, password: string): Promise<any> {
    let result = await this.doLogin(username, password).toPromise();
    if (!result) {
      this.authenticated = false;
      return false;
    }
    const userId = result[0].userId;
    this.user$ = this.getUserByUserId(userId).toPromise();
    this.authenticated = true;
    return true;
  }
  // Sign out
  signOut(): void {
    this.user$ = null;
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
