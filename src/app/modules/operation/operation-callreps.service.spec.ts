import { TestBed } from '@angular/core/testing';

import { OperationCallrepsService } from './operation-callreps.service';

describe('OperationCallrepsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OperationCallrepsService = TestBed.get(OperationCallrepsService);
    expect(service).toBeTruthy();
  });
});
