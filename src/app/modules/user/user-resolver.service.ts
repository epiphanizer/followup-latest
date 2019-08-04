import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { from } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { User } from './user.service';
import { AuthenticationService } from '@app/core';

@Injectable()
export class UserResolver implements Resolve<User> {
  constructor(private authService: AuthenticationService) {}
  resolve(): Observable<User> | any {
    return from(this.authService.getUser());
  }
}
