import { Injectable } from '@angular/core';
import { OAuthSettings } from '@app/oauth';
import { AlertsService } from '@app/core/alerts/alerts.service';
import { Subscription, Observable, throwError } from 'rxjs';
import { map, delay, share, catchError, retry } from 'rxjs/operators';
import { Client } from '@microsoft/microsoft-graph-client';
import { User, UserService } from '@app/modules/user/user.service';
import { Operation, OperationService } from '@app/modules/operation/operation.service';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';
import { KicktechAuthService } from '@app/shared/kicktech-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public authenticated: boolean;
  public user: User;
  private subscription: Subscription;
  constructor(
    private alertsService: AlertsService,
    private http: HttpService,
    private kicktechService: KicktechAuthService,
    private operationService: OperationService,
    private router: Router,
    private userService: UserService
  ) {
    if (!this.authenticated) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
  ngOnInit() {}

  doLogin(username: string, password: string) {
    let result = this.kicktechService.doLogin(username, password);
    console.log(result);
    debugger;
  }

  async getUser(): Promise<User> {
    if (!this.authenticated) return null;

    /**
     * Access Level Assignment
     */
    // try {
    //   switch (userGroups[0]) {
    //     case '2a7f3bb3-2070-4ed0-a8ff-938af3622f71':
    //       user.level = 1;
    //       break;
    //     // Managers
    //     case '7fe26ebf-0cb0-436d-9c02-e5d91f31174e':
    //       user.level = 2;
    //       break;
    //     // Call Reps
    //     case '170650b4-19ce-4fe1-b2b1-75d635a874b6':
    //       user.level = 3;
    //       break;
    //     default:
    //       throw 'Could not assign user level. Something is amiss';
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
    // if (user.level !== 1) {
    //   user.operations = await this.operationService.getOperationsByUserId(user.id).toPromise();
    // } else {
    //   user.operations = await this.operationService.getAllOperations().toPromise();
    // }

    // this.user.operations.forEach((operation: Operation, index: number) => {
    //   this.user.operations[index].currentAssignedPatientCount = operation.currentAssignedPatientCount;
    //   this.user.operations[index].currentNewDischargeCount = operation.currentNewDischargeCount;
    // });
    // return user;
    // return user;
  }
  getUserIdByUserEmail(userEmail: string): Observable<number> {
    return this.http.post<number>('users/lookup', { userEmail: userEmail }).pipe(
      delay(500),
      retry(2),
      share(),
      catchError(error => this.handleAsyncError(error))
    );
  }
  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    // let result = await this.kicktechService.response;
    // if (result) {
    //   this.authenticated = true;
    //   this.user = await this.getUser();
    //   this.router.navigate(['/home'], { replaceUrl: true });
    // }
  }
  // Sign out
  signOut(): void {
    this.user = null;
    this.authenticated = false;
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
      message:
        'We had trouble within the Auth route. \
        Please contact your IT department and relay this message.'
    });
  }
}
