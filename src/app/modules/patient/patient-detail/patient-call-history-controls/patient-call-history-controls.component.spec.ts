import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallHistoryControlsComponent } from './patient-call-history-controls.component';

describe('PatientCallHistoryControlsComponent', () => {
  let component: PatientCallHistoryControlsComponent;
  let fixture: ComponentFixture<PatientCallHistoryControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallHistoryControlsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallHistoryControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
