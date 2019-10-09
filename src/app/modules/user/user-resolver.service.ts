import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { User } from './user';
import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { of } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Promise<User>;
  constructor(
    private authService: AuthenticationService,
    private operationService: OperationService,
    private userService: UserService,
    private router: Router
  ) {}
  async resolve(): Promise<User> {
    let user = this.authService.getUser();
    if (!(await user)) {
      if (localStorage.getItem('followup-user')) {
        user = JSON.parse(localStorage.getItem('followup-user')).user[0];
      }
    }
    return user;
  }
}
