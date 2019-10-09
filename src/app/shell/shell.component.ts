import { Component, OnInit } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  ResolveEnd,
  ParamMap,
  ActivatedRouteSnapshot,
  ChildActivationEnd
} from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { startWith, switchMap, filter, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

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
    // Pass thru navlinks, etc. from child routes
    this.route.url.subscribe(() => {
      if (this.route.snapshot.firstChild) {
        if (this.route.snapshot.firstChild.data.navLinks) {
          this.navLinks = this.route.snapshot.firstChild.data.navLinks;
        }
      } else {
        this.navLinks = [];
      }
    });
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login']);
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
