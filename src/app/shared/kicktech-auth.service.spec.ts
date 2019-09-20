import { TestBed } from '@angular/core/testing';

import { KicktechAuthService } from './kicktech-auth.service';

describe('KicktechAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KicktechAuthService = TestBed.get(KicktechAuthService);
    expect(service).toBeTruthy();
  });
});
