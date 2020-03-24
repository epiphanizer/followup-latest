import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuardService implements CanActivate {
  private roles: {
    role: string;
  }[] = [
    {
      role: 'admin'
    },
    {
      role: 'manager'
    },
    {
      role: 'user'
    }
  ];
  public user: User;
  constructor(
    private authenticationService: AuthenticationService,
    public route: ActivatedRoute,
    public router: Router
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    console.log(currentUser);
    console.log(route.routeConfig.path);
    if (currentUser) {
      // check if route is restricted by role
      console.log('auth guard');
      // console.log(route.data.roles);
      // if (route.data.roles == 'all') {
      //   console.log('all allowed access');
      //   return true;
      // }
      // debugger;
      // if (route.data.roles && route.data.roles.indexOf(this.roles[currentUser.userLevel - 1]) === -1) {
      //   // role not authorised so redirect to home page
      //   this.router.navigate(['/home']);
      //   return false;
      // }

      // authorized so return true
      return true;
    }
    // not logged in so redirect to login page with the return url
    // this.router.navigate(['/login']);
    return false;
  }
}
