import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { from } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { User } from './user';
import { AuthenticationService } from '@app/core';
import { OperationService } from '../operation/operation.service';

@Injectable()
export class UserResolver implements Resolve<User> {
  user: User;
  constructor(private authService: AuthenticationService, private operationService: OperationService) {}
  resolve(): Observable<User> | any {
    let user = <User>{};

    if (user.level !== 1) {
      // user.operations = this.operationService.getOperationsByUserId(user.id).toPromise();
    } else {
      // user.operations = this.operationService.getAllOperations().toPromise();
    }
    // this.user.operations.forEach((operation: Operation, index: number) => {
    //   this.user.operations[index].currentAssignedPatientCount = operation.currentAssignedPatientCount;
    //   this.user.operations[index].currentNewDischargeCount = operation.currentNewDischargeCount;
    // });
    return user;
    // if (!this.authService.user) {
    //   return from(this.authService.getUser());
    // } else {
    //   return from(Observable.of(this.authService.user));
    // }
  }
}
