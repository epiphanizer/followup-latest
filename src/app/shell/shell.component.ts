import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { HostListener } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { of, Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  corkboardExpanded: boolean = false;
  user: User;
  patient: Patient;
  navLinks?: {
    linkName: string;
    linkAction: string;
  }[];
  routeSubscription: Subscription;
  timeSinceLastAction: number;
  userActionSinceLastUpdate: boolean = false;
  version: string = environment.version;

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.userActionSinceLastUpdate = true;
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private authenticationService: AuthenticationService,
    public modalController: ModalController,
    private toastrService: ToastrService
  ) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    this.routeSubscription = this.route.url.subscribe(() => {
      if (this.route.snapshot.firstChild) {
        if (this.route.snapshot.firstChild.data.navLinks) {
          this.navLinks = this.route.snapshot.firstChild.data.navLinks;
        }
      } else {
        this.navLinks = null;
      }
    });

    this.setIdleLogoutTimer();
  }
  updateUserExpiry() {
    /**
     * Updates us within the component
     */
    this.user.userLoginExpires = this.user.userLoginExpires + 300000;
    this.userActionSinceLastUpdate = false;
  }
  setIdleLogoutTimer() {
    var date = new Date();
    var self = this;
    setInterval(function() {
      if (this.userActionSinceLastUpdate) {
        console.log(
          'user has performed an action (mouse movement or keypress), so we are updating their expiry date in localstorage'
        );
        this.updateUserExpiry();
      }
      var currentTime = date.getTime();
      console.log('checking if we need to time out...');
      console.log('current time: ' + currentTime);
      console.log('expiration time: ' + self.user.userLoginExpires);
      if (self.user.userLoginExpires - currentTime < 60000) {
        var timeRemaining = (self.user.userLoginExpires - currentTime) / 1000;
        self.toastrService.success('Your session will log out in ' + timeRemaining + ' seconds due to inactivity!');
      }
      if (currentTime > self.user.userLoginExpires) {
        alert('You have been timed out due to inactivity');
        self.authenticationService.signOut();
      }
    }, 5000);
  }
  corkBoardExpandedHandler(toggleState: boolean) {
    this.corkboardExpanded = toggleState;
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login']);
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
