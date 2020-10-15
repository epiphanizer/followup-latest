import { Component, OnInit, Renderer, ElementRef } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private authenticationService: AuthenticationService,
    public modalController: ModalController,
    private toastrService: ToastrService,
    private _renderer: Renderer,
    private _elementRef: ElementRef
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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: any) {
    this.updateUserExpiry();
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: any) {
    this.updateUserExpiry();
  }

  updateUserExpiry() {
    /**
     * Updates our expire time within the shell component
     */
    this.user.userLoginExpires = this.user.userLoginExpires + 900000;
    this.authenticationService.currentUserValue.userLoginExpires = this.user.userLoginExpires;
    this.userActionSinceLastUpdate = false;
  }
  setIdleLogoutTimer() {
    var self = this;
    setInterval(function() {
      var date = new Date();
      var currentTime = date.getTime();
      if (self.user.userLoginExpires - currentTime < 900000) {
        var timeRemaining = Math.round((self.user.userLoginExpires - currentTime) / 1000);
        self.toastrService.success('Your session will log out in ' + timeRemaining + ' seconds due to inactivity!');
      }
      if (currentTime > self.authenticationService.currentUserValue.userLoginExpires) {
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
