import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { OperationResolver } from './operation-resolver';

describe('OperationResolver (Jest)', () => {
  it('resolves the operation by id and unwraps the first item', () => {
    const operationService = {
      getOperationByOperationId: jest.fn(() => of([{ operationId: 'op-123' }]))
    } as any;
    const resolver = new OperationResolver(operationService);
    const route = ({ paramMap: { get: jest.fn(() => 'op-123') } } as unknown) as ActivatedRouteSnapshot;

    resolver.resolve(route).subscribe(operation => {
      expect(operationService.getOperationByOperationId).toHaveBeenCalledWith('op-123');
      expect(operation.operationId).toBe('op-123');
      expect(resolver.operation).toEqual(operation);
    });
  });
});
