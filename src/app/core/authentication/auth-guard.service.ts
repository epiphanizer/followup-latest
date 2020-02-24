import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuardService implements CanActivate {
  public user: User;
  constructor(
    private authenticationService: AuthenticationService,
    public route: ActivatedRoute,
    public router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthenticated();
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthenticated();
  }

  isAuthenticated(): Promise<boolean> {
    return new Promise(resolve => {
      const authenticated = this.authenticationService.isAuthenticated();
      if (!authenticated) {
        this.router.navigate(['/login']);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  }
  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  //   const currentUser = this.authenticationService.currentUserValue;
  //   if (currentUser) {
  //     // logged in so return true
  //     return true;
  //   }

  //   // not logged in so redirect to login page with the return url
  //   this.router.navigate(['/login'], {
  //     queryParams: {
  //       returnUrl: state.url
  //     }
  //   });
  //   return false;
  // }
}
