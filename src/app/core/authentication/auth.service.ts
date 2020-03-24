import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';

export interface AuthenticationBodyPost {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public authenticated: boolean = false;
  protected userId: number;
  public user$: Promise<User>;

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpService, private jwtHelper: JwtHelperService, private router: Router) {
    console.log('in constructor');
    console.log(JSON.parse(localStorage.getItem('followup-user')));
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
    // console.log('Is authenticated token: ' + token);
    // return a boolean reflecting
    // whether or not the token is expired
    // console.log('token is expired? : ' + !this.jwtHelper.isTokenExpired(token));
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
          if (jwt.userId && jwt.userLevel) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('followup-token', jwt.token);
            localStorage.setItem('followup-user', JSON.stringify(jwt));
            this.currentUserSubject.next(jwt);
            return jwt;
          }
        }),
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(username: string, password: string): Promise<any> {
    let result = await this.doLogin(username, password).toPromise();
    if (!(await result)) {
      return false;
    }
    return result;
  }
  // Sign out
  signOut(): void {
    this.user$ = null;
    this.authenticated = false;
    localStorage.removeItem('followup-user');
    localStorage.removeItem('followup-token');
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
