import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationDetailListingComponent } from './notification-detail-listing.component';

describe('NotificationDetailListingComponent', () => {
  let component: NotificationDetailListingComponent;
  let fixture: ComponentFixture<NotificationDetailListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationDetailListingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationDetailListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
