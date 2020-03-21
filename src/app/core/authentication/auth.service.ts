import { Injectable } from '@angular/core';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { map, share, catchError, retry, tap, timeout } from 'rxjs/operators';
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

  constructor(private http: HttpService, private jwtHelper: JwtHelperService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('followup-user')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  ngOnInit() {}

  public getToken(): string {
    return localStorage.getItem('followup-token');
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    // get the token
    const token = this.getToken();

    // return a boolean reflecting
    // whether or not the token is expired
    return !this.jwtHelper.isTokenExpired(token);
  }

  doLogin(username: string, password: string): Observable<any> {
    return this.http
      .post('users/login', {
        username: username,
        password: password
      })
      .pipe(
        map((jwt: any) => {
          console.log(jwt);
          debugger;
          if (jwt.userId && jwt.userLevel) {
            this.authenticated = true;
            localStorage.setItem('followup-token', jwt.token);
            localStorage.setItem(
              'followup-user',
              JSON.stringify({
                userId: jwt.userId,
                userLevel: jwt.userLevel
              })
            );
            this.currentUserSubject.next(jwt);
            return jwt;
          } else {
            this.authenticated = false;
            // If already on the login page stay there, otherwise
            // send user there
            if (window.location.href.indexOf('/login') != -1) {
              window.location.href = '/login';
            }
          }
        }),
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  public getUser(): Observable<User> {
    if (this.authenticated) {
      return this.getUserByUserId(this.currentUserValue.userId).pipe(
        map((user: User) => {
          return user;
        })
      );
    } else {
      if (window.location.href.indexOf('/login') == -1) {
        window.location.href = '/login';
      }
    }
  }
  getUserByUserId(userId: number): Observable<User> {
    return this.http.get<User>('users/' + userId).pipe(
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
    const userLevel = result.userLevel;

    this.user$ = this.getUserByUserId(userId).toPromise();

    this.getUserByUserId(userId).subscribe((user: User) => {
      user[0].userLevel = userLevel;
      localStorage.setItem(
        'followup-user',
        JSON.stringify({
          user: user
        })
      );
      localStorage.setItem(
        'followup-token',
        JSON.stringify({
          token: 'jwt-token'
        })
      );
    });
    // if (this.jwtHelper.isTokenExpired()) {
    //   this.authenticated = false;
    // }
    this.authenticated = true;
    return true;
  }
  // Sign out
  signOut(): void {
    this.user$ = null;
    this.authenticated = false;
    localStorage.removeItem('followup-user');
    localStorage.removeItem('followup-token');
    localStorage.removeItem('followup-payload');
    localStorage.clear();
    this.currentUserSubject.next(null);
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
      message: 'We had trouble within the authentication service.'
    });
  }
}
