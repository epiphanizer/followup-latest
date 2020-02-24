import { Injectable } from '@angular/core';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { map, share, catchError, retry } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

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

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  constructor(private http: HttpService, private jwtHelper: JwtHelperService, private router: Router) {}
  ngOnInit() {}

  public getToken(): string {
    return localStorage.getItem('followup-token');
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public setLoginAs(token: string) {
    localStorage.setItem('followup-token', token);
    localStorage.setItem('tokenPayload', JSON.stringify(this.jwtHelper.decodeToken(token)));
  }

  public isAuthenticated(): boolean {
    // get the token
    const token = this.getToken();

    // return a boolean reflecting
    // whether or not the token is expired
    return !this.jwtHelper.isTokenExpired(token);
  }

  public getPayload(): any {
    return JSON.parse(localStorage.getItem('tokenPayload'));
  }
  doLogin(username: string, password: string): Observable<any> {
    return this.http
      .post('users/login', {
        username: username,
        password: password
      })
      .pipe(
        map((result: User) => {
          console.log(result);
          if (result == null) {
            this.authenticated = false;
            return;
          }
          if (result.userId) {
            this.authenticated = true;
            localStorage.setItem(
              'followup-user',
              JSON.stringify({
                user: result
              })
            );
            localStorage.setItem('tokenPayload', JSON.stringify(this.jwtHelper.decodeToken(jwt.token)));

            return result;
          }
        }),
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  public getUser(): Promise<User> {
    if (!this.authenticated) {
      /**
       * This will be deprecated in the refactor.
       * We will use a token.
       */
      if (localStorage.getItem('followup-user')) {
        let userObj = JSON.parse(localStorage.getItem('followup-user'));
        return of(userObj).toPromise();
      } else {
        window.location.href = '/login';
        return null;
      }
    }

    return this.user$;
  }
  getUserByUserId(userId: number): Observable<User> {
    return this.http.get<User>('users/' + userId).pipe(
      retry(2),
      share(),
      catchError(error => this.handleAsyncError(error))
    );
  }
  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(username: string, password: string): Promise<any> {
    let result = await this.doLogin(username, password).toPromise();
    if (!(await result)) {
      this.authenticated = false;
      return false;
    }

    const userId = result.userId;

    this.user$ = this.getUserByUserId(userId).toPromise();
    /**
     * Check best practice on this token stuff here.
     * This could very well be deprecated.
     */
    this.getUserByUserId(userId).subscribe((user: User) => {
      localStorage.setItem(
        'followup-user',
        JSON.stringify({
          user: user
        })
      );
      localStorage.setItem(
        'followup-token',
        JSON.stringify({
          token: 'token'
        })
      );
    });
    // if (this.jwtHelper.isTokenExpired() !== false) {
    //   this.authenticated = true;
    // }
    this.authenticated = true;
    return true;
  }
  // Sign out
  signOut(): void {
    this.user$ = null;
    this.authenticated = false;
    /**
     * Check best practice on this token stuff here.
     * This could very well be deprecated.
     */
    localStorage.removeItem('followup-user');
    localStorage.removeItem('followup-token');
    window.location.href = '/login';
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
