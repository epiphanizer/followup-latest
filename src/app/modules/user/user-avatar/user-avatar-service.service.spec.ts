import { TestBed } from '@angular/core/testing';

class UserAvatarServiceService {}

describe('UserAvatarServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [UserAvatarServiceService] }));

  it('should be created', () => {
    const service: UserAvatarServiceService = TestBed.get(UserAvatarServiceService);
    expect(service).toBeTruthy();
  });
});
