import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallQueueSidebarComponent } from './call-queue-sidebar.component';

describe('CallQueueSidebarComponent', () => {
  let component: CallQueueSidebarComponent;
  let fixture: ComponentFixture<CallQueueSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CallQueueSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallQueueSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
