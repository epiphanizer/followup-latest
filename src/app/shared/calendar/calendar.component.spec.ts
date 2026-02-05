import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

@Component({ selector: 'app-call-queue-call-history-calendar', template: '' })
class CallQueueCallHistoryCalendarComponent {}

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
