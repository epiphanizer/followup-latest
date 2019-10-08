import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { startWith, switchMap } from 'rxjs/operators';
import { filter } from 'minimatch';

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
    console.log(this.router);
    debugger;

    // let firstChildParams$ = this.router.events.pipe(
    // startWith(undefined),
    // switchMap(e => this.route.firstChild!.paramMap));
    // firstChildParams$.subscribe(
    //   params => {
    //     console.log(params);
    //     debugger;
    //     this.navLinks = this.route.snapshot.firstChild.data.navLinks;
    //     this.patient = this.route.snapshot.firstChild.data.patient;
    //     debugger;

    //   });
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
