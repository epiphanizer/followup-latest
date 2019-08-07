import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallControlsComponent } from './patient-call-controls.component';

describe('PatientCallControlsComponent', () => {
  let component: PatientCallControlsComponent;
  let fixture: ComponentFixture<PatientCallControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallControlsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
