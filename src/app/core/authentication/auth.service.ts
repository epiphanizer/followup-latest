import { Injectable } from '@angular/core';
import { GraphService } from '@app/graph.service';
import { User } from '@app/modules/user/user.service';
import { OAuthSettings } from '../../../oauth';
import { AlertsService } from '@app/core/alerts/alerts.service';
import { MsalService } from '@azure/msal-angular';
import { Client } from '@microsoft/microsoft-graph-client';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public authenticated: boolean;
  protected user: User;
  constructor(
    private alertsService: AlertsService,
    private graphService: GraphService,
    private msalService: MsalService
  ) {
    this.authenticated = this.getUser() != null;
    this.getUser().then((user: any) => {
      this.user = user;
    });
  }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
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
          return;
        case 'followup-manager':
          user.level = 2;
          return;
        case '170650b4-19ce-4fe1-b2b1-75d635a874b6':
          user.level = 3;
          return;
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
}
