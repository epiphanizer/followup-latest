import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from './auth.service';
@Injectable()
export class AuthGuardService implements CanActivate {
  public user: User;
  constructor(private authService: AuthenticationService, public route: ActivatedRoute, public router: Router) {}
  canActivate(): boolean {
    if (!this.authService.authenticated) {
      alert('in auth guard');
      this.router.navigate(['login']);
      return false;
    }

    return true;
  }
}
