import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientNextCallSchedulerComponent } from './patient-next-call-scheduler.component';

describe('PatientNextCallSchedulerComponent', () => {
  let component: PatientNextCallSchedulerComponent;
  let fixture: ComponentFixture<PatientNextCallSchedulerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientNextCallSchedulerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientNextCallSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
