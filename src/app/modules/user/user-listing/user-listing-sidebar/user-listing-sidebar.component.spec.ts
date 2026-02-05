import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UserListingSidebarComponent } from './user-listing-sidebar.component';

describe('UserListingSidebarComponent (Jest)', () => {
  let component: UserListingSidebarComponent;
  let fixture: ComponentFixture<UserListingSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [UserListingSidebarComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListingSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
    expect(component.todaysDateDay.length).toBe(2);
  });
});
