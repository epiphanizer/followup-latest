import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Logger, LoggingService } from 'ionic-logging-service';
import { AuthenticationService } from '@app/core/authentication/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  logger: Logger = new Logger();
  menu: {} = {};

  constructor(loggingService: LoggingService, private authService: AuthenticationService) {}

  ngOnInit() {
    this.isLoading = true;
    this.getUserMenu(1);
  }
  async signIn(): Promise<void> {
    await this.authService.signIn();

    // Temporary to display the token
    if (this.authService.authenticated) {
      let token = await this.authService.getAccessToken();
      // alert(token);
    }
  }
  /**
   * A function to get the appropriate user menu to display on the initial dashboard.
   * Question: Do we include the option to skip this screen and make a screen a favorite?
   */
  public getUserMenu = function(userId: number) {
    try {
      this.logger.entry(userId);
      console.log('Called function get user menu for user: ' + userId);
      this.menu = [{ name: 'Call Queue', action: '/call-queue', image: '/assets/call-queue.png' }];
    } catch (e) {
      this.logger.error('some error', e);
    }
  };
}
