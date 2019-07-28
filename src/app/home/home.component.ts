import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Logger, LoggingService } from 'ionic-logging-service';
import { User, UserService } from '@app/modules/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  logger: Logger = new Logger();
  user: User;
  public menu: {} = {};

  constructor(loggingService: LoggingService, private userService: UserService) {}

  ngOnInit() {
    try {
      this.isLoading = true;
      /**
       * A function to get the appropriate user menu to display on the initial dashboard.
       * Question: Do we include the option to skip this screen and make a screen a favorite?
       */
      this.user = this.userService.getCurrentUser();
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
      switch (userLevel) {
        case 1:
          this.menu = [
            { name: 'Facilities', action: '/facilities', image: '/assets/icon-facilities.png' },
            { name: 'User Management', action: '/user-management', image: '/assets/icon-user-management.png' },
            { name: 'View Queue', action: '/view-queue', image: '/assets/icon-view-queue.png' },
            { name: 'View Data', action: '/reports', image: '/assets/icon-view-data.png' }
          ];
          break;
        // case 2:
        //   this.menu = [
        //     { name: 'Patients', action: '/patients', image: '/assets/icon-patients.png' },
        //     { name: 'Notifications', action: '/notifications', image: '/assets/icon-notifications.png' },

        //     { name: 'My Profile', action: '/profile', image: '/assets/profile.png' }
        //     //
        //     // { name: 'My Profile', action: '/profile', image: this.getUserAvatarImgSrc() }
        //   ];
        //   break;
        case 3:
          this.menu = [
            { name: 'Call Queue', action: '/call-queue', image: '/assets/icon-call-queue.png' },
            { name: 'My Profile', action: '/profile', image: avatarImage }
          ];
          break;
        default:
          throw 'No User Level assigned, something went wrong.';
      }
    } catch (e) {
      console.log(e);
      this.logger.error('some error', e);
    }
  }
}
