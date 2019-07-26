import { TestBed } from '@angular/core/testing';

import { NotificationRecipientService } from './notification-recipient.service';

describe('NotificationRecipientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotificationRecipientService = TestBed.get(NotificationRecipientService);
    expect(service).toBeTruthy();
  });
});
