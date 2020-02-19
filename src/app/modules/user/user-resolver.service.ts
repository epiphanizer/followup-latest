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
  resolve(): Promise<User> {
    return this.authService.getUser().then((result: User) => {
      console.log(result);
      if (!result[0]) {
        if (localStorage.getItem('followup-user')) {
          let userObj = JSON.parse(localStorage.getItem('followup-user')).user[0] as User;
          this.user = userObj;
        }
      } else {
        this.user = result[0];
      }
      console.log(this.user);
      if (this.user.userLevel != 1) {
        this.user.operations$ = this.operationService.getOperationsByUserId(this.user.userId);
      } else {
        this.user.operations$ = this.operationService.getAllOperations();
        console.log(this.user);
      }
      return this.user;
    });
  }
}
