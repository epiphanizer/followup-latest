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
    return this.authService.getUser().then((jwt: any) => {
      console.log(jwt);
      if (!jwt.user) {
        this.user = jwt[0];
      } else {
        // console.log(result);
        this.user = jwt.user[0];
      }
      if (this.user.userLevel != 1) {
        this.user.operations$ = this.operationService.getOperationsByUserId(this.user.userId);
      } else {
        this.user.operations$ = this.operationService.getAllOperations();
      }
      return this.user;
    });
  }
}
