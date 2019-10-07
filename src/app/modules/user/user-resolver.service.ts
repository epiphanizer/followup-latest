import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { from } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { User } from './user';
import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { UserAvatarService } from './user-avatar/user-avatar.service';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Promise<User>;
  constructor(
    private authService: AuthenticationService,
    private operationService: OperationService,
    private userAvatarService: UserAvatarService
  ) {}
  resolve(): Observable<User> | any {
    if (!this.authService.user) {
      this.user$ = this.authService.getUser().then((data: User) => {
        let user = data[0];
        return user;
      });
    } else {
      return this.authService.user;
    }
  }
}
