import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

@Component({ selector: 'app-notification-manager-listing', template: '' })
class NotificationManagerListingComponent {}

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
