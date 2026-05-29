import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperationService } from '../operation/operation.service';
import { Operation } from './operation';

@Injectable()
export class OperationResolver implements Resolve<Operation> {
  operation: Operation;
  operation$: Observable<Operation>;
  constructor(private operationService: OperationService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<Operation> {
    const operationId = route.paramMap.get('operationId');
    this.operation$ = this.operationService.getOperationByOperationId(operationId).pipe(
      map((operation: Operation | Operation[]) => {
        const resolvedOperation = Array.isArray(operation) ? operation[0] : operation;
        this.operation = resolvedOperation;
        return resolvedOperation;
      })
    );
    return this.operation$;
  }
}
