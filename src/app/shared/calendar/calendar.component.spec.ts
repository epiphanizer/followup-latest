import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallQueueCallHistoryCalendarComponent } from './call-queue-call-history-calendar.component';

describe('CallQueueCallHistoryCalendarComponent', () => {
  let component: CallQueueCallHistoryCalendarComponent;
  let fixture: ComponentFixture<CallQueueCallHistoryCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CallQueueCallHistoryCalendarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallQueueCallHistoryCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
