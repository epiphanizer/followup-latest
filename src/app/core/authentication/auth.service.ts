import { Injectable } from '@angular/core';
import { GraphService } from '@app/shared/graph.service';
import { OAuthSettings } from '../../../oauth';
import { AlertsService } from '@app/core/alerts/alerts.service';
import { Subscription } from 'rxjs';
import { MsalService, BroadcastService } from '@azure/msal-angular';
import { Client } from '@microsoft/microsoft-graph-client';
import { User } from '@app/modules/user/user.service';

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
    private graphService: GraphService,
    private msalService: MsalService
  ) {
    this.authenticated = this.msalService.getUser() != null;
    this.getUser().then(user => {
      this.user = user;
    });
  }
  ngOnInit() {
    this.broadcastService.subscribe('msal:loginFailure', payload => {
      console.log('login failure ' + JSON.stringify(payload));
      this.authenticated = false;
    });

    this.broadcastService.subscribe('msal:loginSuccess', payload => {
      console.log('login success ' + JSON.stringify(payload));
      this.authenticated = true;
    });
  }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    console.log('signing in');
    // this.msalService.loginRedirect(OAuthSettings.scopes);

    let result = await this.msalService.loginPopup(OAuthSettings.scopes).catch(reason => {
      this.alertsService.add('Login failed', JSON.stringify(reason, null, 2));
    });
    if (result) {
      this.authenticated = true;
      this.user = await this.getUser();
    }
  }

  private async getUser(): Promise<User> {
    if (!this.authenticated) return null;

    let graphClient = Client.init({
      authProvider: async done => {
        let token = await this.graphService.getAccessToken().catch(reason => {
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
    user.displayName = graphUser.displayName;
    // Prefer the mail property, but fall back to userPrincipalName
    user.email = graphUser.mail || graphUser.userPrincipalName;
    const userGroups = await this.graphService.getUserMemberGroups();

    try {
      switch (userGroups[0]) {
        case 'followup-admin':
          user.level = 1;
          break;
        case 'followup-manager':
          user.level = 2;
          break;
        case '170650b4-19ce-4fe1-b2b1-75d635a874b6':
          user.level = 3;
          break;
        default:
          throw 'Could not assign user level. Something is amiss';
      }
    } catch (error) {
      console.log(error);
    }
    return user;
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
}
