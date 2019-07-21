import { Injectable } from '@angular/core';
import { Client } from '@microsoft/microsoft-graph-client';

import { AuthenticationService } from '@app/core/authentication/auth.service';
import { AlertsService } from '@app/core/alerts/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private graphClient: Client;
  constructor(private authService: AuthenticationService, private alertsService: AlertsService) {
    // Initialize the Graph client
    this.graphClient = Client.init({
      authProvider: async done => {
        // Get the token from the auth service
        let token = await this.authService.getAccessToken().catch((reason: any) => {
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

  async getUserMemberGroups(): Promise<Event[]> {
    try {
      const securityEnabledOnlyFlag = {
        securityEnabledOnly: true
      };
      let result = await this.graphClient.api('/me/getMemberGroups').post(securityEnabledOnlyFlag);
      debugger;
      return result.value;
    } catch (error) {
      this.alertsService.add('Could not get member groups', JSON.stringify(error, null, 2));
    }
  }
}
