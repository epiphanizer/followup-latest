import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

import { AlertsService } from '@app/core/alerts/alerts.service';
import { OAuthSettings } from 'oauth';
import { User } from '@app/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public authenticated: boolean;
  public user: User;

  constructor(private msalService: MsalService, private alertsService: AlertsService) {
    this.authenticated = false;
    this.user = null;
  }

  // Sign out
  signOut(): void {
    this.msalService.logout();
    this.user = null;
    this.authenticated = false;
  }

  // Silently request an access token
  async getAccessToken(): Promise<string> {
    let result = await this.msalService.acquireTokenSilent(OAuthSettings.scopes).catch(reason => {
      this.alertsService.add('Get token failed', JSON.stringify(reason, null, 2));
    });

    // Temporary to display token in an error box
    if (result) this.alertsService.add('Token acquired', result);
    return result;
  }
}
