import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Logger, LoggingService } from 'ionic-logging-service';
import { User } from '@app/modules/user/user.service';

import { merge, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private subscription: Subscription;
  public user: any;
  public menu:
    | [
        {
          name: string;
          action: string;
          image: string;
        }
      ]
    | [] = [];
  constructor(private authService: AuthenticationService, private broadcastService: BroadcastService) {}

  ngOnInit() {
    this.subscription = this.broadcastService.subscribe('msal:loginSuccess', (payload: any) => {
      console.log('login success ' + JSON.stringify(payload));
      this.user = this.authService.user;
      debugger;
      const userLevel = this.user.level;
      /**
       * Simple switch for getting appropriate avatar or default passed thru
       */
      let avatarImage = '';
      if (!this.user.avatar) {
        avatarImage = '/assets/default-avatar.png';
      } else {
        avatarImage = this.user.avatar;
      }
      debugger;
      switch (userLevel) {
        case 1:
          this.menu = [
            { name: 'Facilities', action: '/admin/facilities', image: '/assets/icon-facilities.png' },
            { name: 'User Management', action: '/admin/user', image: '/assets/icon-user-management.png' },
            { name: 'View Queue', action: '/admin/call-queue', image: '/assets/icon-view-queue.png' },
            { name: 'View Data', action: '/admin/data', image: '/assets/icon-view-data.png' }
          ];
          break;
        case 2:
          this.menu = [
            { name: 'Patients', action: '/manager/patients', image: '/assets/icon-patients.png' },
            { name: 'Notifications', action: '/manager/notifications', image: '/assets/icon-notifications.png' },
            { name: 'My Profile', action: '/user/profile', image: avatarImage }
          ];
          break;
        case 3:
          this.menu = [
            { name: 'Call Queue', action: '/call-queue', image: '/assets/icon-call-queue.png' },
            { name: 'My Profile', action: '/user/profile', image: avatarImage }
          ];
          break;
        default:
          throw 'No User Level assigned, something went wrong.';
      }
    });

    this.authService.signIn();
  }
}
