import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Logger, LoggingService } from 'ionic-logging-service';
import { AuthenticationService } from '@app/core/authentication/auth.service';
import { User, UserService } from '@app/core/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  logger: Logger = new Logger();
  user: User;
  menu: {} = {};

  constructor(
    loggingService: LoggingService,
    private authService: AuthenticationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    /**
     * A function to get the appropriate user menu to display on the initial dashboard.
     * Question: Do we include the option to skip this screen and make a screen a favorite?
     */
    try {
      debugger;
      switch (this.user.level) {
        case 1:
          this.menu = [
            { name: 'Call Queue', action: '/call-queue', image: '/assets/icon-call-queue.png' },
            { name: 'My Profile', action: '/profile', image: this.user.avatar }
          ];
          break;
        case 2:
          this.menu = [
            { name: 'Patients', action: '/patients', image: '/assets/icon-patients.png' },
            { name: 'Notifications', action: '/notifications', image: '/assets/icon-notifications.png' },

            { name: 'My Profile', action: '/profile', image: '/assets/profile.png' }
            //
            // { name: 'My Profile', action: '/profile', image: this.getUserAvatarImgSrc() }
          ];
          break;
        case 3:
          this.menu = [
            { name: 'Facilities', action: '/facilities', image: '/assets/icon-facilities.png' },
            { name: 'User Management', action: '/user-management', image: '/assets/icon-user-management.png' },
            { name: 'View Queue', action: '/view-queue', image: '/assets/icon-view-queue.png' },
            { name: 'View Data', action: '/reports', image: '/assets/icon-view-data.png' }
          ];
          break;
        default:
          throw 'No User ID given';
      }
    } catch (e) {
      this.logger.error('some error', e);
    }
  }
}
