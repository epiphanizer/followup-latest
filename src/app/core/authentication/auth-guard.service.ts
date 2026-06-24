import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  public user: User;
  constructor(private authenticationService: AuthenticationService, public router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.authenticationService.currentUserValue;
    if (user) {
      if (route.data.roles && route.data.roles.indexOf(user.userLevel) === -1) {
        // role not authorised so redirect to home page
        this.router.navigate(['/home']);
        return false;
      }
      // authorised so return true
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: state.url || '/home'
      }
    });
    return false;
  }
}
