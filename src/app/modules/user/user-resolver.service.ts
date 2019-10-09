import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { User } from './user';
import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { of } from 'rxjs';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Promise<User>;
  constructor(private authService: AuthenticationService, private operationService: OperationService) {}
  resolve(): Promise<User> {
    console.log('at resolver');
    return this.authService.getUser().then((res: User) => {
      console.log(res);
      debugger;
      if (!res) {
        console.log('no res');
        if (localStorage.getItem('followup-user')) {
          let userObj = JSON.parse(localStorage.getItem('followup-user')).user[0] as User;
          userObj.operations$ = this.operationService.getOperationsByUserId(userObj.userId);

          // user.then((user: User) => {
          //     this.user = user;
          //     return user;
          //   }
          // );
        }
      }
      return this.user;
    });
  }
}
