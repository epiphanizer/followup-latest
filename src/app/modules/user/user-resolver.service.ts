import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { User, UserService } from './user.service';
import { AuthenticationService } from '@app/core';

@Injectable()
export class UserResolver implements Resolve<User> {
  constructor(private authService: AuthenticationService) {}

  async signIn(): Observable<User> {
    await this.authService.signIn();
    let user = of(this.authService.user);
    return user;
  }
  resolve(): Observable<User> {
    return this.signIn();
  }
}
