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
     * Method to get the user based on a DB match
     * from Graph
     */
  }
}
