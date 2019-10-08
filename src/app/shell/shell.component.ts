import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthenticationService } from '@app/core';
import { ModalController } from '@ionic/angular';
import { NotificationModalComponent } from './notification-modal/notification-modal.component';
import { Patient } from '@app/modules/patient/patient';
import { User } from '@app/modules/user/user';
import { startWith, switchMap, filter, map, mergeMap, tap } from 'rxjs/operators';

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

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route),
        map((route: ActivatedRoute) => {
          console.log(route);
          alert('mapping');
          while (route.firstChild) {
            route = route.firstChild;
            console.log(route);
            return route;
          }
        }),
        mergeMap(route => route.paramMap),
        tap(paramMap => console.log('ParamMap', paramMap))
      )
      .subscribe(
        // Get the params (paramAsMap.params) and use them to highlight or everything that meet your need
        paramAsMap => {
          console.log(paramAsMap);
          debugger;
        }
      );
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
