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
    // const firstChildParams$ = this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd),
    //   startWith(undefined),
    //   switchMap(e => this.route.firstChild!.paramMap)
    // );

    // firstChildParams$.subscribe(params => {
    //   console.log(this.route.root);
    //   console.log(this.route.root.firstChild);
    //   alert('resolved');
    // });
    // .subscribe(
    //   // Get the params (paramAsMap.params) and use them to highlight or everything that meet your need
    //   () => {
    //     console.log(this.route.root);
    //     debugger;
    //   }
    // );

    //   let paramSubscription = this.route.paramMap.subscribe(
    //     ( params: ParamMap ) : void => {

    //         console.log( "Parent ID changed:", params.get( "id" ) );

    //         this.id = params.get( "operation" );

    //     }
    // );
    this.router.events
      .pipe(
        filter(e => e instanceof ChildActivationEnd),
        map(() => this.route.snapshot),
        map(route => {
          alert('here');
          while (route.firstChild) {
            // get first child
            route = route.firstChild;
            return route;
          }
        })
      )
      .subscribe((route: ActivatedRouteSnapshot) => {
        console.log(route.data);
      });
  }
  signOut() {
    this.authenticationService.signOut();
    this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }
}
