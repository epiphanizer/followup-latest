import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallStatusControlsComponent } from './patient-call-status-controls.component';

describe('PatientCallStatusControlsComponent', () => {
  let component: PatientCallStatusControlsComponent;
  let fixture: ComponentFixture<PatientCallStatusControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallStatusControlsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallStatusControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
