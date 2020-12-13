import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallQueuePatientFilterComponent } from './call-queue-patient-filter.component';

describe('CallQueuePatientFilterComponent', () => {
  let component: CallQueuePatientFilterComponent;
  let fixture: ComponentFixture<CallQueuePatientFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CallQueuePatientFilterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallQueuePatientFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
