import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { User } from './user';
import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';
import { of } from 'rxjs';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  user$: Promise<User>;
  constructor(private authService: AuthenticationService, private operationService: OperationService) {}
  async resolve(): Promise<User> {
    let user = this.authService.getUser();
    return user;
  }
}
