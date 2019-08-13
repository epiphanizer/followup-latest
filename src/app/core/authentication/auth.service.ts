import { Injectable } from '@angular/core';
import { OAuthSettings } from '../../../oauth';
import { AlertsService } from '@app/core/alerts/alerts.service';
import { Subscription, Observable, throwError } from 'rxjs';
import { map, delay, share, catchError, retry } from 'rxjs/operators';
import { MsalService, BroadcastService } from '@azure/msal-angular';
import { Client } from '@microsoft/microsoft-graph-client';
import { User } from '@app/modules/user/user.service';
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
  private subscription: Subscription;
  constructor(
    private alertsService: AlertsService,
    private broadcastService: BroadcastService,
    private http: HttpService,
    private msalService: MsalService,
    private operationService: OperationService,
    private router: Router
  ) {
    this.authenticated = this.msalService.getUser() != null;
    if (!this.authenticated) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
  ngOnInit() {
    this.broadcastService.subscribe('msal:loginSuccess', payload => {
      window.location.href = '/';
    });
  }

  async getAccessToken(): Promise<string> {
    let result = await this.msalService.acquireTokenSilent(OAuthSettings.scopes).catch(reason => {
      this.alertsService.add('Get token failed', JSON.stringify(reason, null, 2));
    });

    // Temporary to display token in an error box
    if (result) this.alertsService.add('Token acquired', result);
    return result;
  }

  async getUser(): Promise<User> {
    if (!this.authenticated) return null;

    let graphClient = Client.init({
      authProvider: async done => {
        let token = await this.getAccessToken().catch(reason => {
          done(reason, null);
        });

        if (token) {
          done(null, token);
        } else {
          done('Could not get an access token', null);
        }
      }
    });

    // Get the user from Graph (GET /me)
    let graphUser = await graphClient.api('/me').get();
    let user = <User>{};
    this.user = user;
    user.displayName = graphUser.displayName;
    // Prefer the mail property, but fall back to userPrincipalName
    user.email = (await graphUser.mail) || graphUser.userPrincipalName;
    /**
     * Make some assignments to the <User> object
     */
    try {
      user.id$ = await this.getUserIdByUserEmail(user.email).pipe(
        map((user: any) => {
          this.user.id = user[0].userId;
          return user[0].userId;
        }),
        share()
      );
    } catch (error) {
      this.router.navigate(['/login'], { replaceUrl: true });
      throw error;
    }

    user.id = await user.id$.toPromise();

    /**
     * Check our graph groups for membership
     */
    const securityEnabledOnlyFlag = {
      securityEnabledOnly: true
    };
    const userGroups = await graphClient
      .api('/me/getMemberGroups')
      .post(securityEnabledOnlyFlag)
      .then(result => {
        return result.value;
      })
      .catch(error => {
        this.alertsService.add('Could not get member groups', JSON.stringify(error, null, 2));
      });

    /**
     * Access Level Assignment
     */
    try {
      switch (userGroups[0]) {
        case '2a7f3bb3-2070-4ed0-a8ff-938af3622f71':
          user.level = 1;
          break;
        // Managers
        case '7fe26ebf-0cb0-436d-9c02-e5d91f31174e':
          user.level = 2;
          break;
        // Call Reps
        case '170650b4-19ce-4fe1-b2b1-75d635a874b6':
          user.level = 3;
          break;
        default:
          throw 'Could not assign user level. Something is amiss';
      }
    } catch (error) {
      console.log(error);
    }
    // If user is primary admin, let them thru without assignment.
    if (!(user.level == 1) && !(user.level == 2)) {
      user.operations = await this.operationService.getOperationsByUserId(user.id).toPromise();
      this.user.operations.forEach((operation: Operation, index: number) => {
        this.user.operations[index].currentAssignedPatientCount = operation.currentAssignedPatientCount;
        this.user.operations[index].currentNewDischargeCount = operation.currentNewDischargeCount;
      });
    }
    return user;
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
    let result = await this.msalService.loginPopup(OAuthSettings.scopes).catch(reason => {
      alert('login failed');
      this.alertsService.add('Login failed', JSON.stringify(reason, null, 2));
    });
    if (result) {
      this.authenticated = true;
      this.user = await this.getUser();
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }
  // Sign out
  signOut(): void {
    this.msalService.logout();
    this.user = null;
    this.authenticated = false;
  }

  ngOnDestroy() {
    this.broadcastService.getMSALSubject().next(1);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
