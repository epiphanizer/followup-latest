import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';
import { User } from '@app/modules/user/user';
import { AuthenticationService } from './auth.service';
import { from, of } from 'rxjs';
@Injectable()
export class AuthGuardService implements CanActivate {
  public user: User;
  constructor(private authService: AuthenticationService, public route: ActivatedRoute, public router: Router) {}
  canActivate(): boolean {
    this.authService.getUser().then((user: any) => {
      console.log(user);
      this.user = user;
      debugger;
    });
    console.log(this.route.snapshot.data);
    if (!this.user) {
      this.router.navigate(['login']);
      return false;
    }
    if (this.user.level == 3) {
      this.router.navigate(['call-queue']);
    }
    return true;
  }
}
