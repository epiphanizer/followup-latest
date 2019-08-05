import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSummaryWidgetComponent } from './patient-summary-widget.component';

describe('PatientSummaryWidgetComponent', () => {
  let component: PatientSummaryWidgetComponent;
  let fixture: ComponentFixture<PatientSummaryWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientSummaryWidgetComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSummaryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
