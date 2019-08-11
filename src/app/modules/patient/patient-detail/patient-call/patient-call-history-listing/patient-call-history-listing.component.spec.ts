import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientCallHistoryListingComponent } from './patient-call-history-listing.component';

describe('PatientCallHistoryListingComponent', () => {
  let component: PatientCallHistoryListingComponent;
  let fixture: ComponentFixture<PatientCallHistoryListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PatientCallHistoryListingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientCallHistoryListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
