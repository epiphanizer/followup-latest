import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { OperationContactsService } from './operation-contacts.service';
import { map } from 'rxjs/operators';
import { OperationService, Operation } from '../operation/operation.service';
import { OperationCallRepsService } from './operation-callreps.service';

@Injectable()
export class OperationResolver implements Resolve<Operation> {
  operation: Operation;
  operation$: Observable<Operation>;
  constructor(
    private operationService: OperationService,
    private operationContactsService: OperationContactsService,
    private operationCallRepsService: OperationCallRepsService
  ) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Operation> {
    const operationId = route.paramMap.get('operationId');
    this.operation$ = this.operationService.getOperationByOperationId(+operationId).pipe(
      map((operation: Operation) => {
        operation = operation[0];
        operation.operationCallReps$ = this.operationCallRepsService.getOperationCallRepsByOperationId(
          operation.operationId
        );
        operation.operationContacts$ = this.operationContactsService.getOperationContactsByOperationId(
          operation.operationId
        );
        this.operation = operation;
        return operation;
      })
    );
    return this.operation$;
  }
}
