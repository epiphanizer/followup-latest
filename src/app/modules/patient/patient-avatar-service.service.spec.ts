import { TestBed } from '@angular/core/testing';

import { PatientAvatarServiceService } from './patient-avatar-service.service';

describe('PatientAvatarServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PatientAvatarServiceService = TestBed.get(PatientAvatarServiceService);
    expect(service).toBeTruthy();
  });
});
