import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallQueueLegendComponent } from './call-queue-legend.component';

describe('CallQueueLegendComponent', () => {
  let component: CallQueueLegendComponent;
  let fixture: ComponentFixture<CallQueueLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CallQueueLegendComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallQueueLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
