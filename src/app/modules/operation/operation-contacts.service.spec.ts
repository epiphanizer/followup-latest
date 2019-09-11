import { TestBed } from '@angular/core/testing';

import { OperationContactsService } from './operation-contacts.service';

describe('OperationContactsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OperationContactsService = TestBed.get(OperationContactsService);
    expect(service).toBeTruthy();
  });
});
