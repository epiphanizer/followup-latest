import { TestBed } from '@angular/core/testing';

import { OperationCallRepsService } from './operation-callreps.service';

describe('OperationCallRepsService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [OperationCallRepsService] }));

  it('should be created', () => {
    const service: OperationCallRepsService = TestBed.get(OperationCallRepsService);
    expect(service).toBeTruthy();
  });
});
