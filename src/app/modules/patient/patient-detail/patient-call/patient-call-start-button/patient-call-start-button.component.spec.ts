import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallStartButtonComponent } from './patient-call-start-button.component';

describe('PatientCallStartButtonComponent', () => {
  let component: PatientCallStartButtonComponent;
  let fixture: ComponentFixture<PatientCallStartButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallStartButtonComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallStartButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
