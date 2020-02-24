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
    return this.authService.getUser().then((result: any) => {
      console.log(result);
      if (!result) {
        console.log('assigning user from cache');
        if (localStorage.getItem('followup-user')) {
          let userObj = JSON.parse(localStorage.getItem('followup-user')).user[0] as User;
          this.user = userObj;
        }
      } else {
        console.log('assigning user');
        console.log(result.user);
        this.user = result.user;
      }
      console.log(this.user);
      // console.log(this.user);
      if (this.user.userLevel != 1) {
        this.user.operations$ = this.operationService.getOperationsByUserId(this.user.userId);
      } else {
        this.user.operations$ = this.operationService.getAllOperations();
        // console.log(this.user);
      }
      return this.user;
    });
  }
}
