import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { User } from './user';
import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Promise<User>;
  constructor(private authService: AuthenticationService, private operationService: OperationService) {}
  async resolve(): Promise<User> {
    let user = await this.authService.getUser();
    if (!user) {
      if (localStorage.getItem('followup-user')) {
        user = JSON.parse(localStorage.getItem('followup-user')).user[0] as User;
      }
    }
    user.operations$ = this.operationService.getOperationsByUserId(user.userId);
    return user;
  }
}
