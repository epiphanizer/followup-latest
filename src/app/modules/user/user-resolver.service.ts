import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { from, of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { User } from './user';
import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Promise<User>;
  constructor(private authService: AuthenticationService, private operationService: OperationService) {}
  resolve(): Promise<User> {
    if (this.authService.user$) {
      this.user$ = this.authService.user$.then((data: User) => {
        let user = data[0];
        user.operations$ = this.operationService.getOperationsByUserId(user.userId);
        return user;
      });
      return this.user$;
    } else {
      this.user$ = this.authService.getUser();
    }
  }
}
