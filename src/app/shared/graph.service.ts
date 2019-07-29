import { Injectable } from '@angular/core';
import { Client } from '@microsoft/microsoft-graph-client';

import { MsalService } from '@azure/msal-angular';
import { OAuthSettings } from 'oauth';
import { AlertsService } from '@app/core/alerts/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private graphClient: Client;
  constructor(private msalService: MsalService, private alertsService: AlertsService) {
    // Initialize the Graph client
    this.graphClient = Client.init({
      authProvider: async done => {
        // Get the token from the auth service
        let token = await this.getAccessToken().catch((reason: any) => {
          done(reason, null);
        });

        if (token) {
          done(null, token);
        } else {
          done('Could not get an access token', null);
        }
      }
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

  async getUserMemberGroups(): Promise<string> {
    try {
      const securityEnabledOnlyFlag = {
        securityEnabledOnly: true
      };
      let result = await this.graphClient.api('/me/getMemberGroups').post(securityEnabledOnlyFlag);
      return result.value;
    } catch (error) {
      this.alertsService.add('Could not get member groups', JSON.stringify(error, null, 2));
    }
  }
}
