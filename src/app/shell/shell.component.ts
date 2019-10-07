import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  user: User;
  patient: Patient;
  navLinks?: {
    linkName: string;
    linkAction: string;
  }[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private authenticationService: AuthenticationService,
    public modalController: ModalController
  ) {}
  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    debugger;
    // Pass thru navlinks, etc. from child routes
    this.route.url.subscribe(() => {
      if (this.route.snapshot.firstChild) {
        this.navLinks = this.route.snapshot.firstChild.data.navLinks;
        this.patient = this.route.snapshot.firstChild.data.patient;
      }
    });
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
