import { PatientAvatarService } from './patient-avatar.service';

describe('PatientAvatarService (legacy spec)', () => {
  it('creates with minimal stubs', () => {
    const service = new PatientAvatarService({} as any);
    expect(service).toBeTruthy();
  });
});
