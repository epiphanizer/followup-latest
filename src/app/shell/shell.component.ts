import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { of, Subscription } from 'rxjs';
import { environment } from '@env/environment';

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
  version: string = environment.version;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private authenticationService: AuthenticationService,
    public modalController: ModalController
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
  setIdleLogoutTimer() {
    var date = new Date();
    var self = this;
    var token = JSON.parse(self.authenticationService.getToken());
    setTimeout(function() {
      var currentTime = date.getTime();
      console.log('checking if we need to time out');
      if (currentTime > token.expires) {
        alert('You have been timed out due to inactivity');
        self.authenticationService.signOut();
      }
    }, 15000);
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
