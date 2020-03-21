import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';

import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { map } from 'rxjs/operators';
import { User } from '@app/modules/user/user';
import { Observable } from 'rxjs';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  constructor(private authService: AuthenticationService, private operationService: OperationService) {}
  resolve(): Observable<User> {
    return this.authService.getUser().pipe(
      map((user: User) => {
        if (user) {
          this.user = user;
        }
        /** Fetch all operations if user is admin, otherwise, get user ops. */
        if (this.user.userLevel != 1) {
          this.user.operations$ = this.operationService.getOperationsByUserId(this.user.userId);
        } else {
          this.user.operations$ = this.operationService.getAllOperations();
        }
        return this.user;
      })
    );
  }
}
