import { PatientCallService } from './patient-call.service';

describe('PatientCallService (Jest)', () => {
  it('creates with minimal http stub', () => {
    const http = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } as any;
    const service = new PatientCallService(http as any);

    expect(service).toBeTruthy();
  });
});
