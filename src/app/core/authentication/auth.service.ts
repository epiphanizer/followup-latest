import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { OperationService } from '@app/modules/operation/operation.service';
import { Operation, OperationGroup } from '@app/modules/operation/operation';

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

  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    private http: HttpService,
    private jwtHelper: JwtHelperService,
    private _operationService: OperationService
  ) {
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

  doLogin(username: string, password: string): Observable<any> {
    return this.http
      .post('users/login', {
        username: username,
        password: password
      })
      .pipe(
        retry(0),
        map((jwt: any) => {
          if (jwt.token) {
            var token = this.jwtHelper.decodeToken(jwt.token);
            if (token.user.userId && token.user.userLevel) {
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              localStorage.setItem('followup-token', JSON.stringify({ expires: token.expires }));
              var user = token.user;
              this._operationService.getOperationsByUserId(user.userId).subscribe(res => {
                if (res) {
                  user.operations = res;
                }
                this._operationService.getOperationGroups().subscribe(res => {
                  if (res) {
                    user.operationGroups = res;
                  }

                  user.operationGroups.forEach((operationGroup: OperationGroup) => {
                    // Could use a stronger approach but this does the trick

                    operationGroup.operations = user.operations
                      .filter((operation: Operation) => {
                        return operationGroup.operationGroupId == operation.operationGroupId;
                      })
                      .sort(function(a: Operation, b: Operation) {
                        if (a.operationName < b.operationName) {
                          return -1;
                        }
                        if (a.operationName > b.operationName) {
                          return 1;
                        }
                        return 0;
                      });
                  });

                  user.operationGroups = user.operationGroups.filter((operationGroup: OperationGroup) => {
                    return operationGroup.operations?.length > 0;
                  });
                });
                localStorage.setItem('followup-user', JSON.stringify(user));
              });
              this.currentUserSubject.next(user);

              return token;
            }
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
  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signOut(userId: string): Promise<any> {
    let result = await this.doLogout(userId).toPromise();
    if (!(await result)) {
      return false;
    }
    return result;
  }
  // Sign out
  doLogout(userId: string): Observable<any> {
    return this.http
      .post('users/logout', {
        userId: userId
      })
      .pipe(
        map(() => {
          this.user$ = null;
          this.authenticated = false;
          localStorage.removeItem('followup-user');
          localStorage.removeItem('followup-token');
          localStorage.clear();
          this.currentUserSubject.next(null);
          window.location.href = '/login';
        }),
        catchError(e => this.handleAsyncError(e)) // then handle the error
      );
  }

  ngOnDestroy() {}

  private handleAsyncError(error: HttpErrorResponse) {
    console.log(error);
    debugger;
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
