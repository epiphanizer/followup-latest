import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAvatarComponent } from './patient-avatar.component';

describe('PatientAvatarComponent', () => {
  let component: PatientAvatarComponent;
  let fixture: ComponentFixture<PatientAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientAvatarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
