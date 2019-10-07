import { TestBed } from '@angular/core/testing';

import { UserAvatarServiceService } from './user-avatar-service.service';

describe('UserAvatarServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserAvatarServiceService = TestBed.get(UserAvatarServiceService);
    expect(service).toBeTruthy();
  });
});
