import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from './auth.service';
import { Location } from '@angular/common';

@Injectable()
export class AuthGuardService implements CanActivate {
  public user: User;
  constructor(
    private authenticationService: AuthenticationService,
    private location: Location,
    public route: ActivatedRoute,
    public router: Router
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.authenticationService.currentUserValue;
    if (user) {
      if (route.data.roles && route.data.roles.indexOf(user.userLevel) === -1) {
        // role not authorised so redirect to home page
        this.router.navigate(['/home']);
        return false;
      }

      console.log('Found user is role:' + user.userLevel);
      // authorised so return true
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.location.back();
    return false;
  }
}
