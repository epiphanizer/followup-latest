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
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      // check if route is restricted by role
      console.log(currentUser);
      console.log('auth guard');
      debugger;
      if (route.data.roles && route.data.roles.indexOf(currentUser.userLevel) === -1) {
        // role not authorised so redirect to home page
        this.router.navigate(['/home']);
        return false;
      }

      // authorized so return true
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login']);
    return false;
  }
}
