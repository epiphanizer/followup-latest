import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallQueuePatientListingComponent } from './call-queue-patient-listing.component';

describe('CallQueuePatientListingComponent', () => {
  let component: CallQueuePatientListingComponent;
  let fixture: ComponentFixture<CallQueuePatientListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CallQueuePatientListingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallQueuePatientListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
