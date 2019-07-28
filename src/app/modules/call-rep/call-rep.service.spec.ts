import { TestBed } from '@angular/core/testing';

import { CallRepService } from './call-rep.service';

describe('CallRepService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CallRepService = TestBed.get(CallRepService);
    expect(service).toBeTruthy();
  });
});
