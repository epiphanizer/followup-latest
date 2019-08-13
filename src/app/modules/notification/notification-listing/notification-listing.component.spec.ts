import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationManagerListingComponent } from './notification-manager-listing.component';

describe('NotificationManagerListingComponent', () => {
  let component: NotificationManagerListingComponent;
  let fixture: ComponentFixture<NotificationManagerListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationManagerListingComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationManagerListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
