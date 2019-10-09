import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { User } from '@app/modules/user/user';

@Injectable()
export class AuthGuardService implements CanActivate {
  user: User;
  constructor(private route: ActivatedRoute);
  canActivate() {
    //Your redirect logic/condition. I use this.
    this.user == this.route.snapshot.data.user;
    if (this.user && this.user.profile.role == 'Guest') {
      this.router.navigate(['dashboard']);
    }
    console.log('AuthGuard#canActivate called');
    return true;
  }
  //Constructor
  constructor(private router: Router) {}
}
