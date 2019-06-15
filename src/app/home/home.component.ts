import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Logger, LoggingService } from 'ionic-logging-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  logger: Logger;
  constructor(loggingService: LoggingService) {
    this.logger = loggingService.getLogger('MyApp.MyComponent');
    const methodName = 'ctor';
    this.logger.entry(methodName);
    this.logger.exit(methodName);
    return;
  }

  ngOnInit() {
    this.isLoading = true;
    this.getUserMenu(1);
  }
  /**
   * A function to get the appropriate user menu to display on the initial dashboard.
   * Question: Do we include the option to skip this screen and make a screen a favorite?
   */
  public getUserMenu = function(userId: number) {
    const methodName = arguments.callee.toString();
    debugger;
    this.logger.entry(methodName, userId);
    try {
    } catch (e) {
      this.logger.error(methodName, 'some error', e);
    }
    console.log('Called function get user menu.');
  };
}
