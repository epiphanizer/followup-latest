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

  it('marks dates in the future as schedulable and emits', () => {
    const emitSpy = jest.spyOn(component.patientNextCallDateSelectedEventEmitter, 'emit');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    component.handleDateFilterChangeEvent(futureDate.toISOString());

    expect(component.status.scheduled).toBe(true);
    expect(component.scheduledCallDate).toContain('-');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('rejects past dates via compareDates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);

    expect(component.compareDates(past)).toBe(true);
  });
});
