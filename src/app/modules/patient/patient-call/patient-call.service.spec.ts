import { TestBed } from '@angular/core/testing';

import { PatientCallService } from './patient-call.service';

describe('PatientCallService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PatientCallService = TestBed.get(PatientCallService);
    expect(service).toBeTruthy();
  });
});
