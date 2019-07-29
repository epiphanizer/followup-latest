import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Logger, I18nService, untilDestroyed, AuthenticationService } from '@app/core';
import { Subscription } from 'rxjs';
import { MsalService, BroadcastService } from '@azure/msal-angular';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  authenticated: boolean;
  subscription: Subscription;
  public user: any;
  public menu: {}[] = [{}];
  constructor(private authService: AuthenticationService, private broadcastService: BroadcastService) {}

  ngOnInit() {
    this.subscription = this.broadcastService.subscribe('msal:loginSuccess', (payload: any) => {
      this.user = this.authService.user;
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
    if (!this.authService.authenticated) {
      this.authService.signIn();
    }
  }
  ngOnDestroy() {
    this.broadcastService.getMSALSubject().next(1);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
