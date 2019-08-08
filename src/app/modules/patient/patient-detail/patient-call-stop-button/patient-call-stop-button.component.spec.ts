import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallStopButtonComponent } from './patient-call-stop-button.component';

describe('PatientCallStopButtonComponent', () => {
  let component: PatientCallStopButtonComponent;
  let fixture: ComponentFixture<PatientCallStopButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallStopButtonComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallStopButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
