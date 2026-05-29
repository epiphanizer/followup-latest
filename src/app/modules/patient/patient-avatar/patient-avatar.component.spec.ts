import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAvatarComponent } from './patient-avatar.component';

describe('PatientAvatarComponent', () => {
  let component: PatientAvatarComponent;
  let fixture: ComponentFixture<PatientAvatarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PatientAvatarComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAvatarComponent);
    component = fixture.componentInstance;
    component.patient = { patientId: 'test-id' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
