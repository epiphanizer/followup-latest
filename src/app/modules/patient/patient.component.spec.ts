import { PatientComponent } from './patient.component';

describe('PatientComponent (Jest)', () => {
  it('constructs without Angular TestBed', () => {
    const comp = new PatientComponent();

    expect(comp).toBeTruthy();
  });
});
