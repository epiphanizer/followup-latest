import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject, of, firstValueFrom, forkJoin } from 'rxjs';
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
  selectedUserId?: string;
}

export interface LoginAccountChoice {
  userId: string;
  username: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
  userActive?: boolean;
  deleted?: boolean;
  userCreated?: string;
  userModified?: string;
}

export interface LoginAccountSelectionResponse {
  requiresAccountSelection: true;
  message: string;
  canonicalUsername: string;
  requestedUserId?: string;
  suggestedUserId?: string;
  selectionReason?: string;
  accountChoices: LoginAccountChoice[];
}

function formatBackendErrorBody(errorBody: unknown): string {
  if (typeof errorBody === 'string') {
    return errorBody;
  }

  if (errorBody === undefined || errorBody === null) {
    return '';
  }

  if (typeof errorBody === 'object') {
    try {
      return JSON.stringify(errorBody);
    } catch (_error) {
      return String(errorBody);
    }
  }

  return String(errorBody);
}

function isJwtToken(value: string | null): boolean {
  return !!value && value.split('.').length === 3;
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
  public impersonatorSubject: BehaviorSubject<User>;
  public impersonator: Observable<User>;

  constructor(
    private http: HttpService,
    private jwtHelper: JwtHelperService,
    private _operationService: OperationService
  ) {
    const existingToken = localStorage.getItem('followup-token');
    if (!this.isTokenSessionActive(existingToken)) {
      this.clearStoredSession(false);
    }

    this.currentUserSubject = new BehaviorSubject<User>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
    this.impersonatorSubject = new BehaviorSubject<User>(this.getStoredImpersonator());
    this.impersonator = this.impersonatorSubject.asObservable();
  }

  ngOnInit() {}

  public getToken(): string {
    const token = localStorage.getItem('followup-token');

    if (!this.isTokenSessionActive(token)) {
      this.clearStoredSession(false);
      return null;
    }

    return token;
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get impersonatorValue(): User {
    return this.impersonatorSubject.value;
  }

  private isOperationActive(operation: Operation): boolean {
    return Number((operation as any)?.operationActive) !== 0;
  }

  private filterActiveOperationGroups(operationGroups: OperationGroup[]): OperationGroup[] {
    return (Array.isArray(operationGroups) ? operationGroups : []).filter((operationGroup: OperationGroup) => {
      return Number(operationGroup?.operationGroupActive) !== 0;
    });
  }

  private applyVisibleOperationContext(user: User, operationGroups: OperationGroup[]): void {
    const activeOperationGroups = this.filterActiveOperationGroups(operationGroups || []);
    const activeOperationGroupIds = new Set(
      activeOperationGroups.map((operationGroup: OperationGroup) => operationGroup.operationGroupId)
    );

    user.operations = (user.operations || []).filter((operation: Operation) => {
      return activeOperationGroupIds.has(operation.operationGroupId) && this.isOperationActive(operation);
    });

    activeOperationGroups.forEach((operationGroup: OperationGroup) => {
      operationGroup.operations = (user.operations || [])
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

    user.operationGroups = activeOperationGroups.filter((operationGroup: OperationGroup) => {
      return operationGroup.operations?.length > 0;
    });
  }

  doLogin(username: string, password: string, selectedUserId?: string): Observable<any> {
    return this.http
      .post('users/login', {
        username: username,
        password: password,
        selectedUserId: selectedUserId
      })
      .pipe(
        retry(0),
        map((jwt: any) => {
          if (jwt.token) {
            var token = this.jwtHelper.decodeToken(jwt.token);
            if (token.user.userId && token.user.userLevel) {
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              localStorage.setItem('followup-token', jwt.token);
              var user = token.user;
              forkJoin({
                operations: this._operationService.getOperationsByUserId(user.userId),
                groups: this._operationService.getOperationGroups()
              }).subscribe({
                next: ({ operations, groups }) => {
                  user.operations = operations || [];
                  this.applyVisibleOperationContext(user, groups || []);
                  localStorage.setItem('operationGroups', JSON.stringify(user.operationGroups || []));
                  this.currentUserSubject.next(user);
                  localStorage.setItem('followup-user', JSON.stringify(user));
                },
                error: () => {
                  localStorage.setItem('followup-user', JSON.stringify(user));
                }
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
  async signIn(username: string, password: string, selectedUserId?: string): Promise<any> {
    const result = await firstValueFrom(this.doLogin(username, password, selectedUserId));
    if (!(await result)) {
      return false;
    }
    return result;
  }
  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signOut(userId: string): Promise<any> {
    const result = await firstValueFrom(this.doLogout(userId));
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
          this.clearSessionAndRedirect();
        }),
        catchError((error: HttpErrorResponse) => {
          this.logLogoutError(error);
          this.clearSessionAndRedirect();
          return of(null);
        })
      );
  }

  startImpersonation(targetUser: User, impersonator: User): Promise<User> {
    if (!targetUser || !impersonator) {
      return Promise.resolve(null);
    }
    const now = Date.now();
    targetUser.userLoginExpires = now + 900000;
    localStorage.setItem('followup-impersonator', JSON.stringify(impersonator));
    this.impersonatorSubject.next(impersonator);
    this.currentUserSubject.next(targetUser);
    localStorage.setItem('followup-user', JSON.stringify(targetUser));
    return this.refreshUserContext(targetUser);
  }

  stopImpersonation(): Promise<User> {
    const impersonator = this.impersonatorSubject.value || this.getStoredImpersonator();
    if (!impersonator) {
      return Promise.resolve(null);
    }
    const now = Date.now();
    impersonator.userLoginExpires = now + 900000;
    localStorage.removeItem('followup-impersonator');
    this.impersonatorSubject.next(null);
    this.currentUserSubject.next(impersonator);
    localStorage.setItem('followup-user', JSON.stringify(impersonator));
    return this.refreshUserContext(impersonator);
  }

  private getStoredImpersonator(): User {
    const stored = localStorage.getItem('followup-impersonator');
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch (_error) {
      localStorage.removeItem('followup-impersonator');
      return null;
    }
  }

  private getStoredUser(): User {
    const stored = localStorage.getItem('followup-user');
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch (_error) {
      localStorage.removeItem('followup-user');
      return null;
    }
  }

  private isTokenSessionActive(token: string | null): boolean {
    if (!isJwtToken(token)) {
      return false;
    }

    try {
      const decoded = this.jwtHelper.decodeToken(token);
      const userLoginExpires = Number(decoded?.user?.userLoginExpires || 0);
      return Number.isFinite(userLoginExpires) && userLoginExpires > Date.now();
    } catch (_error) {
      return false;
    }
  }

  private clearStoredSession(clearAllStorage: boolean) {
    localStorage.removeItem('followup-user');
    localStorage.removeItem('followup-token');
    localStorage.removeItem('followup-impersonator');

    if (clearAllStorage) {
      localStorage.clear();
    }
  }

  private refreshUserContext(user: User): Promise<User> {
    if (!user) {
      return Promise.resolve(null);
    }
    localStorage.removeItem('operationGroups');
    return new Promise(resolve => {
      forkJoin({
        operations: this._operationService.getOperationsByUserId(user.userId),
        groups: this._operationService.getOperationGroups()
      }).subscribe({
        next: ({ operations, groups }) => {
          user.operations = operations || [];
          this.applyVisibleOperationContext(user, groups || []);
          localStorage.setItem('operationGroups', JSON.stringify(user.operationGroups || []));
          localStorage.setItem('followup-user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          resolve(user);
        },
        error: () => {
          localStorage.setItem('followup-user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          resolve(user);
        }
      });
    });
  }

  ngOnDestroy() {}

  private handleAsyncError(error: HttpErrorResponse) {
    const backendMessage = typeof error.error === 'string' ? error.error : error?.error?.message;
    const backendErrorBody = formatBackendErrorBody(error.error);

    if (error.status === 409 && error?.error?.requiresAccountSelection) {
      return throwError({
        status: error.status,
        ...error.error
      });
    }

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${backendErrorBody}`);
    }
    // return an observable with a user-facing error message
    return throwError({
      status: error.status,
      message: backendMessage || 'We had trouble within the authentication service.'
    });
  }

  private clearSessionAndRedirect() {
    this.user$ = null;
    this.authenticated = false;
    this.clearStoredSession(true);
    this.currentUserSubject.next(null);
    this.impersonatorSubject.next(null);
    window.location.href = '/login';
  }

  private logLogoutError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, ` + `body was: ${formatBackendErrorBody(error.error)}`);
    }
  }
}
