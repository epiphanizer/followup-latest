import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallQueueCalendarWidgetComponent } from './call-queue-calendar-widget.component';

describe('CallQueueCalendarWidgetComponent', () => {
  let component: CallQueueCalendarWidgetComponent;
  let fixture: ComponentFixture<CallQueueCalendarWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CallQueueCalendarWidgetComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallQueueCalendarWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
